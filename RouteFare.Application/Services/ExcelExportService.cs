using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Export;
using RouteFare.Domain.Entities;
using System.Drawing;

namespace RouteFare.Application.Services;

public class ExcelExportService : IExcelExportService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IExportProgressHub _exportProgressHub;


    public ExcelExportService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IExportProgressHub exportProgressHub)
    {
        _context = context;
        _currentUser = currentUser;
        _exportProgressHub = exportProgressHub;
    }

    public async Task<Result<byte[]>> ExportPricingDataAsync(ExportRequestDto request)
    {
        try
        {
            var jobId = Guid.NewGuid().ToString();
            await SendProgressUpdate(jobId, 0, "Starting export...");

            // Set EPPlus license for non-commercial personal use
            ExcelPackage.License.SetNonCommercialPersonal("RouteFare Development");

            using var package = new ExcelPackage();

            // Apply authorization filter
            var query = _context.Set<Pricing>()
                .Include(p => p.TourOperator)
                .Include(p => p.Route)
                .Include(p => p.Season)
                .Include(p => p.BookingClass)
                .AsQueryable();

            if (!_currentUser.IsAdmin)
            {
                if (_currentUser.TourOperatorId.HasValue)
                {
                    query = query.Where(p => p.TourOperatorId == _currentUser.TourOperatorId.Value);
                }
                else
                {
                    return Result<byte[]>.Failure("Unauthorized");
                }
            }

            if (request.TourOperatorId.HasValue)
                query = query.Where(p => p.TourOperatorId == request.TourOperatorId.Value);

            if (request.SeasonId.HasValue)
                query = query.Where(p => p.SeasonId == request.SeasonId.Value);

            if (request.RouteId.HasValue)
                query = query.Where(p => p.RouteId == request.RouteId.Value);

            await SendProgressUpdate(jobId, 20, "Fetching data...");
            var pricingData = await query.ToListAsync();

            if (request.IncludeSummary)
            {
                await SendProgressUpdate(jobId, 40, "Creating summary sheet...");
                CreateSummarySheet(package, pricingData);
            }

            if (request.IncludeDetails)
            {
                await SendProgressUpdate(jobId, 60, "Creating detailed sheet...");
                CreateDetailedSheet(package, pricingData);
            }

            await SendProgressUpdate(jobId, 80, "Finalizing export...");
            var excelData = package.GetAsByteArray();

            await SendProgressUpdate(jobId, 100, "Export complete!");
            return Result<byte[]>.Success(excelData);
        }
        catch (Exception ex)
        {
            return Result<byte[]>.Failure($"Export failed: {ex.Message}");
        }
    }

    private void CreateSummarySheet(ExcelPackage package, List<Pricing> pricingData)
    {
        var worksheet = package.Workbook.Worksheets.Add("Summary");

        // Headers
        worksheet.Cells[1, 1].Value = "Tour Operator";
        worksheet.Cells[1, 2].Value = "Route";
        worksheet.Cells[1, 3].Value = "Season";
        worksheet.Cells[1, 4].Value = "Booking Class";
        worksheet.Cells[1, 5].Value = "Total Days";
        worksheet.Cells[1, 6].Value = "Average Price";
        worksheet.Cells[1, 7].Value = "Min Price";
        worksheet.Cells[1, 8].Value = "Max Price";
        worksheet.Cells[1, 9].Value = "Total Seats Requested";

        // Style headers
        using (var range = worksheet.Cells[1, 1, 1, 9])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        // Group and summarize data
        var summaryData = pricingData
            .GroupBy(p => new
            {
                TourOperatorName = p.TourOperator.Name,
                RouteCode = p.Route.RouteCode,
                SeasonName = p.Season.Name,
                BookingClassName = p.BookingClass.Name
            })
            .Select(g => new
            {
                TourOperatorName = g.Key.TourOperatorName,
                g.Key.RouteCode,
                SeasonName = g.Key.SeasonName,
                BookingClassName = g.Key.BookingClassName,
                TotalDays = g.Select(p => p.Date).Distinct().Count(),
                AveragePrice = g.Average(p => p.Price),
                MinPrice = g.Min(p => p.Price),
                MaxPrice = g.Max(p => p.Price),
                TotalSeats = g.Sum(p => p.RequestedSeats)
            })
            .ToList();

        // Populate data
        int row = 2;
        foreach (var item in summaryData)
        {
            worksheet.Cells[row, 1].Value = item.TourOperatorName;
            worksheet.Cells[row, 2].Value = item.RouteCode;
            worksheet.Cells[row, 3].Value = item.SeasonName;
            worksheet.Cells[row, 4].Value = item.BookingClassName;
            worksheet.Cells[row, 5].Value = item.TotalDays;
            worksheet.Cells[row, 6].Value = item.AveragePrice;
            worksheet.Cells[row, 7].Value = item.MinPrice;
            worksheet.Cells[row, 8].Value = item.MaxPrice;
            worksheet.Cells[row, 9].Value = item.TotalSeats;

            // Format currency cells
            worksheet.Cells[row, 6, row, 8].Style.Numberformat.Format = "$#,##0.00";

            row++;
        }

        // Auto-fit columns
        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
    }

    private void CreateDetailedSheet(ExcelPackage package, List<Pricing> pricingData)
    {
        var worksheet = package.Workbook.Worksheets.Add("Detailed Pricing");

        var bookingClasses = _context.Set<BookingClass>()
            .Where(bc => bc.IsActive)
            .OrderBy(bc => bc.DisplayOrder)
            .ToList();

        int col = 1;
        worksheet.Cells[1, col++].Value = "Tour Operator";
        worksheet.Cells[1, col++].Value = "Route";
        worksheet.Cells[1, col++].Value = "Season";
        worksheet.Cells[1, col++].Value = "Date";
        worksheet.Cells[1, col++].Value = "Day of Week";

        foreach (var bookingClass in bookingClasses)
        {
            worksheet.Cells[1, col++].Value = $"{bookingClass.Name} Price";
            worksheet.Cells[1, col++].Value = $"{bookingClass.Name} Seats";
        }

        // Style headers
        using (var range = worksheet.Cells[1, 1, 1, col - 1])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(Color.DarkBlue);
            range.Style.Font.Color.SetColor(Color.White);
            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        // Group data by tour operator, route, season, and date
        var groupedData = pricingData
            .GroupBy(p => new
            {
                TourOperator = p.TourOperator.Name,
                Route = p.Route.RouteCode,
                Season = p.Season.Name,
                p.Date
            })
            .OrderBy(g => g.Key.TourOperator)
            .ThenBy(g => g.Key.Route)
            .ThenBy(g => g.Key.Season)
            .ThenBy(g => g.Key.Date)
            .ToList();

        // Populate data
        int row = 2;
        foreach (var group in groupedData)
        {
            col = 1;
            worksheet.Cells[row, col++].Value = group.Key.TourOperator;
            worksheet.Cells[row, col++].Value = group.Key.Route;
            worksheet.Cells[row, col++].Value = group.Key.Season;
            worksheet.Cells[row, col++].Value = group.Key.Date.ToString("yyyy-MM-dd");
            worksheet.Cells[row, col++].Value = group.Key.Date.DayOfWeek.ToString();

            foreach (var bookingClass in bookingClasses)
            {
                var pricing = group.FirstOrDefault(p => p.BookingClassId == bookingClass.Id);
                if (pricing != null)
                {
                    worksheet.Cells[row, col++].Value = pricing.Price;
                    worksheet.Cells[row, col++].Value = pricing.RequestedSeats;
                }
                else
                {
                    worksheet.Cells[row, col++].Value = 0;
                    worksheet.Cells[row, col++].Value = 0;
                }
            }

            for (int i = 6; i < col; i += 2)
            {
                worksheet.Cells[row, i].Style.Numberformat.Format = "$#,##0.00";
            }

            if (row % 2 == 0)
            {
                using (var range = worksheet.Cells[row, 1, row, col - 1])
                {
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }
            }

            row++;
        }

        using (var range = worksheet.Cells[1, 1, row - 1, col - 1])
        {
            range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
        }

        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

        worksheet.View.FreezePanes(2, 4);
    }

    private async Task SendProgressUpdate(string jobId, int progress, string message)
    {
        if (!string.IsNullOrEmpty(_currentUser.UserId))
        {
            await _exportProgressHub.SendProgress(_currentUser.UserId, progress, message);
        }
    }
}
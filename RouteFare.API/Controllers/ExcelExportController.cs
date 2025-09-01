using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.Export;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExcelExportService _exportService;

    public ExportController(IExcelExportService exportService)
    {
        _exportService = exportService;
    }

    /// <summary>
    /// Export pricing data to Excel file
    /// </summary>
    /// <param name="request">Export request parameters including filters and export types</param>
    [HttpPost("excel")]
    [ProducesResponseType(typeof(FileResult), 200)]
    public async Task<IActionResult> ExportToExcel([FromBody] ExportRequestDto request)
    {
        var result = await _exportService.ExportPricingDataAsync(request);

        if (!string.IsNullOrEmpty(result.JobId))
        {
            Response.Headers["X-Job-Id"] = result.JobId;
        }

        var fileName = $"PricingData_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
        return File(result.Data!, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}
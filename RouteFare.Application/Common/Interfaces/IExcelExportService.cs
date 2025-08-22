using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Export;

namespace RouteFare.Application.Common.Interfaces;

public interface IExcelExportService
{
    Task<Result<byte[]>> ExportPricingDataAsync(ExportRequestDto request);
}
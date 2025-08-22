using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Pricing;

namespace RouteFare.Application.Common.Interfaces;

public interface IPricingService
{
    Task<Result<PricingTableDto>> GetPricingTableAsync(int tourOperatorRouteId);
    Task<Result<PagedResult<PricingDto>>> GetPricingsAsync(PricingFilterDto filter);
    Task<Result> UpdatePricingAsync(UpdatePricingDto dto);
    Task<Result> BulkUpdatePricingAsync(BulkPricingUpdateDto dto);
    Task<Result<List<PricingDto>>> GetPricingByDateRangeAsync(int tourOperatorId, int routeId, DateTime startDate, DateTime endDate);
}

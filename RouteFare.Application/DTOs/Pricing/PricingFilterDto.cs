using RouteFare.Application.Common.Models;

namespace RouteFare.Application.DTOs.Pricing;

public class PricingFilterDto : PaginationParams
{
    public int? TourOperatorId { get; set; }
    public int? RouteId { get; set; }
    public int? SeasonId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
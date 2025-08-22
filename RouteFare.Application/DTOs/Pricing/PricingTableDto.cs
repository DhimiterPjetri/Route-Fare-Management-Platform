namespace RouteFare.Application.DTOs.Pricing;

public class PricingTableDto
{
    public int TourOperatorId { get; set; }
    public string TourOperatorName { get; set; } = string.Empty;
    public int RouteId { get; set; }
    public string RouteCode { get; set; } = string.Empty;
    public int SeasonId { get; set; }
    public string SeasonName { get; set; } = string.Empty;
    public List<PricingRowDto> Rows { get; set; } = new();
}
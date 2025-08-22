namespace RouteFare.Application.DTOs.Pricing;

public class PricingDto
{
    public int Id { get; set; }
    public int TourOperatorId { get; set; }
    public string TourOperatorName { get; set; } = string.Empty;
    public int RouteId { get; set; }
    public string RouteCode { get; set; } = string.Empty;
    public int SeasonId { get; set; }
    public string SeasonName { get; set; } = string.Empty;
    public int BookingClassId { get; set; }
    public string BookingClassName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int RequestedSeats { get; set; }
}
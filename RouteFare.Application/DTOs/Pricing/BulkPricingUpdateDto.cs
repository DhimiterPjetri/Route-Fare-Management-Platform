namespace RouteFare.Application.DTOs.Pricing;

public class BulkPricingUpdateDto
{
    public int TourOperatorRouteId { get; set; }
    public BulkUpdateType UpdateType { get; set; }
    public List<DayOfWeek>? DaysOfWeek { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Dictionary<int, decimal> ClassPrices { get; set; } = new(); 
    public Dictionary<int, int> ClassSeats { get; set; } = new(); 
}

public enum BulkUpdateType
{
    AllDays,
    SpecificDaysOfWeek,
    DateRange
}
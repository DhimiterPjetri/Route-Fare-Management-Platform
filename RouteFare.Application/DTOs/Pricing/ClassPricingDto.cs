namespace RouteFare.Application.DTOs.Pricing;

public class ClassPricingDto
{
    public int BookingClassId { get; set; }
    public string BookingClassName { get; set; } = string.Empty;
    public string BookingClassCode { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int RequestedSeats { get; set; }
}
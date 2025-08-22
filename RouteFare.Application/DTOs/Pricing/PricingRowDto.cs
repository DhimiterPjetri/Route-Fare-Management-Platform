namespace RouteFare.Application.DTOs.Pricing;

public class PricingRowDto
{
    public DateTime Date { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public List<ClassPricingDto> ClassPricing { get; set; } = new();
}
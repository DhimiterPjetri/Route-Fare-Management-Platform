using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.Pricing;

public class PricingUpdateItemDto
{
    public DateTime Date { get; set; }
    public int BookingClassId { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }
    
    [Range(0, int.MaxValue)]
    public int RequestedSeats { get; set; }
}
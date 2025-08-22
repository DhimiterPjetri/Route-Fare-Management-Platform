using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.Pricing;

public class UpdatePricingDto
{
    [Required]
    public int TourOperatorRouteId { get; set; }
    
    [Required]
    public List<PricingUpdateItemDto> Updates { get; set; } = new();
}
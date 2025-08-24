using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.Route;

public class CreateRouteDto
{
    [Required]
    [StringLength(100)]
    public string Origin { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Destination { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? RouteCode { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    [Required]
    public List<int> BookingClassIds { get; set; } = new List<int>();
}
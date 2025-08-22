using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.Route;

public class UpdateRouteDto
{
    [Required]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Origin { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Destination { get; set; } = string.Empty;
    
    public bool IsActive { get; set; }
}
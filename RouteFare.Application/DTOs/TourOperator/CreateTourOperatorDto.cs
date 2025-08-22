using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.TourOperator;

public class CreateTourOperatorDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string ContactEmail { get; set; } = string.Empty;
    
    [Phone]
    public string ContactPhone { get; set; } = string.Empty;
    
    public List<int> BookingClassIds { get; set; } = new();
    
    public CreateOperatorUserDto? InitialUser { get; set; }
}
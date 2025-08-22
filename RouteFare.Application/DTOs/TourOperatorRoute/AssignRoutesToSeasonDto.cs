using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.TourOperatorRoute;

public class AssignRoutesToSeasonDto
{
    [Required]
    public int SeasonId { get; set; }
    
    [Required]
    public List<int> RouteIds { get; set; } = new();
    
    public int? TourOperatorId { get; set; } 
}
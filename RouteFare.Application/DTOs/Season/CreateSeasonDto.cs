using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.Season;

public class CreateSeasonDto
{
    [Required]
    [Range(2024, 2100)]
    public int Year { get; set; }
    
    public bool IsActive { get; set; } = true;
}
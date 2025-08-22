using System.ComponentModel.DataAnnotations;

namespace RouteFare.Application.DTOs.BookingClass;

public class UpdateBookingClassDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(1, 100)]
    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }
}
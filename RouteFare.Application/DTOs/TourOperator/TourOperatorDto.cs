using RouteFare.Application.DTOs.BookingClass;

namespace RouteFare.Application.DTOs.TourOperator;

public class TourOperatorDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<BookingClassDto> BookingClasses { get; set; } = new();
    public int UserCount { get; set; }
}
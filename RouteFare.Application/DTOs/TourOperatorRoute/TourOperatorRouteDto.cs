using RouteFare.Application.DTOs.BookingClass;

namespace RouteFare.Application.DTOs.TourOperatorRoute;

public class TourOperatorRouteDto
{
    public int Id { get; set; }
    public int TourOperatorId { get; set; }
    public string TourOperatorName { get; set; } = string.Empty;
    public int RouteId { get; set; }
    public string RouteCode { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public int SeasonId { get; set; }
    public string SeasonName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<BookingClassDto> AvailableBookingClasses { get; set; } = new List<BookingClassDto>();
}
namespace RouteFare.Domain.Entities;

public class RouteBookingClass
{
    public int RouteId { get; set; }
    public virtual Route Route { get; set; } = null!;
    public int BookingClassId { get; set; }
    public virtual BookingClass BookingClass { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
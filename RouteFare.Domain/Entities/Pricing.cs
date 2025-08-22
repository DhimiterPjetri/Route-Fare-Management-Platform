using RouteFare.Domain.Common;

namespace RouteFare.Domain.Entities;

public class Pricing : AuditableEntity
{
    public int TourOperatorId { get; set; }
    public virtual TourOperator TourOperator { get; set; } = null!;    
    public int RouteId { get; set; }
    public virtual Route Route { get; set; } = null!;    
    public int SeasonId { get; set; }
    public virtual Season Season { get; set; } = null!;    
    public int BookingClassId { get; set; }
    public virtual BookingClass BookingClass { get; set; } = null!;    
    public DateTime Date { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public decimal Price { get; set; }
    public int RequestedSeats { get; set; }    
    public int TourOperatorRouteId { get; set; }
    public virtual TourOperatorRoute TourOperatorRoute { get; set; } = null!;
}
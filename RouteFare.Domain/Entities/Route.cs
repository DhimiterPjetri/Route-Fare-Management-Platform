using RouteFare.Domain.Common;

namespace RouteFare.Domain.Entities;

public class Route : AuditableEntity
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string RouteCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<TourOperatorRoute> TourOperatorRoutes { get; set; } = new List<TourOperatorRoute>();
    public virtual ICollection<RouteBookingClass> RouteBookingClasses { get; set; } = new List<RouteBookingClass>();
    public virtual ICollection<Pricing> Pricings { get; set; } = new List<Pricing>();
}
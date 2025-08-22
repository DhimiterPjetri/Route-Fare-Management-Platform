using RouteFare.Domain.Common;

namespace RouteFare.Domain.Entities;

public class TourOperatorRoute : AuditableEntity
{
    public int TourOperatorId { get; set; }
    public virtual TourOperator TourOperator { get; set; } = null!;    
    public int RouteId { get; set; }
    public virtual Route Route { get; set; } = null!;    
    public int SeasonId { get; set; }
    public virtual Season Season { get; set; } = null!;    
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<Pricing> Pricings { get; set; } = new List<Pricing>();
}
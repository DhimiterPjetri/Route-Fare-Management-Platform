using RouteFare.Domain.Common;
using RouteFare.Domain.Enums;

namespace RouteFare.Domain.Entities;

public class Season : AuditableEntity
{
    public int Year { get; set; }
    public SeasonType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<TourOperatorRoute> TourOperatorRoutes { get; set; } = new List<TourOperatorRoute>();
    public virtual ICollection<Pricing> Pricings { get; set; } = new List<Pricing>();
}
using RouteFare.Domain.Common;

namespace RouteFare.Domain.Entities;

public class TourOperator : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    public virtual ICollection<TourOperatorBookingClass> BookingClasses { get; set; } = new List<TourOperatorBookingClass>();
    public virtual ICollection<TourOperatorRoute> Routes { get; set; } = new List<TourOperatorRoute>();
    public virtual ICollection<Pricing> Pricings { get; set; } = new List<Pricing>();
}
using RouteFare.Domain.Common;

namespace RouteFare.Domain.Entities;

public class BookingClass : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<TourOperatorBookingClass> TourOperatorBookingClasses { get; set; } = new List<TourOperatorBookingClass>();
    public virtual ICollection<Pricing> Pricings { get; set; } = new List<Pricing>();
}
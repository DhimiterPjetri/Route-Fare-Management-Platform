namespace RouteFare.Domain.Entities;

public class TourOperatorBookingClass
{
    public int TourOperatorId { get; set; }
    public virtual TourOperator TourOperator { get; set; } = null!;    
    public int BookingClassId { get; set; }
    public virtual BookingClass BookingClass { get; set; } = null!;    
    public bool IsActive { get; set; } = true;
}
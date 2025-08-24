using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class RouteBookingClassConfiguration : IEntityTypeConfiguration<RouteBookingClass>
{
    public void Configure(EntityTypeBuilder<RouteBookingClass> builder)
    {
        builder.ToTable("RouteBookingClasses");
        
        builder.HasKey(rb => new { rb.RouteId, rb.BookingClassId });
        
        builder.HasOne(rb => rb.Route)
            .WithMany(r => r.RouteBookingClasses)
            .HasForeignKey(rb => rb.RouteId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(rb => rb.BookingClass)
            .WithMany(b => b.RouteBookingClasses)
            .HasForeignKey(rb => rb.BookingClassId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
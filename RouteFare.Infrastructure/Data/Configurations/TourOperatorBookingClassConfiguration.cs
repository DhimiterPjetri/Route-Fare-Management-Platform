using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class TourOperatorBookingClassConfiguration : IEntityTypeConfiguration<TourOperatorBookingClass>
{
    public void Configure(EntityTypeBuilder<TourOperatorBookingClass> builder)
    {
        builder.ToTable("TourOperatorBookingClasses");
        
        builder.HasKey(tb => new { tb.TourOperatorId, tb.BookingClassId });
        
        builder.HasOne(tb => tb.TourOperator)
            .WithMany(t => t.BookingClasses)
            .HasForeignKey(tb => tb.TourOperatorId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(tb => tb.BookingClass)
            .WithMany(b => b.TourOperatorBookingClasses)
            .HasForeignKey(tb => tb.BookingClassId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
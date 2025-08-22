using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class PricingConfiguration : IEntityTypeConfiguration<Pricing>
{
    public void Configure(EntityTypeBuilder<Pricing> builder)
    {
        builder.ToTable("Pricings");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Price)
            .HasPrecision(18, 2);
            
        builder.HasOne(p => p.TourOperator)
            .WithMany(t => t.Pricings)
            .HasForeignKey(p => p.TourOperatorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(p => p.Route)
            .WithMany(r => r.Pricings)
            .HasForeignKey(p => p.RouteId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(p => p.Season)
            .WithMany(s => s.Pricings)
            .HasForeignKey(p => p.SeasonId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(p => p.BookingClass)
            .WithMany(b => b.Pricings)
            .HasForeignKey(p => p.BookingClassId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(p => p.TourOperatorRoute)
            .WithMany(tr => tr.Pricings)
            .HasForeignKey(p => p.TourOperatorRouteId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasIndex(p => new { p.TourOperatorId, p.RouteId, p.SeasonId, p.BookingClassId, p.Date })
            .IsUnique();
    }
}
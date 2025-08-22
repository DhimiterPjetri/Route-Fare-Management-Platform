using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class TourOperatorRouteConfiguration : IEntityTypeConfiguration<TourOperatorRoute>
{
    public void Configure(EntityTypeBuilder<TourOperatorRoute> builder)
    {
        builder.ToTable("TourOperatorRoutes");
        
        builder.HasKey(tr => tr.Id);
        
        builder.HasOne(tr => tr.TourOperator)
            .WithMany(t => t.Routes)
            .HasForeignKey(tr => tr.TourOperatorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(tr => tr.Route)
            .WithMany(r => r.TourOperatorRoutes)
            .HasForeignKey(tr => tr.RouteId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(tr => tr.Season)
            .WithMany(s => s.TourOperatorRoutes)
            .HasForeignKey(tr => tr.SeasonId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasIndex(tr => new { tr.TourOperatorId, tr.RouteId, tr.SeasonId })
            .IsUnique();
    }
}
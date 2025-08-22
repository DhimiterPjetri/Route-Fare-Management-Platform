using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class RouteConfiguration : IEntityTypeConfiguration<Route>
{
    public void Configure(EntityTypeBuilder<Route> builder)
    {
        builder.ToTable("Routes");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Origin)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(r => r.Destination)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(r => r.RouteCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.HasIndex(r => r.RouteCode)
            .IsUnique();
    }
}
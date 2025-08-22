using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class TourOperatorConfiguration : IEntityTypeConfiguration<TourOperator>
{
    public void Configure(EntityTypeBuilder<TourOperator> builder)
    {
        builder.ToTable("TourOperators");
        
        builder.HasKey(t => t.Id);
        
        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(t => t.ContactEmail)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(t => t.ContactPhone)
            .HasMaxLength(20);
            
        builder.HasIndex(t => t.Code)
            .IsUnique();
    }
}
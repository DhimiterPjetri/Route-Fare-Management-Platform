using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data.Configurations;

public class BookingClassConfiguration : IEntityTypeConfiguration<BookingClass>
{
    public void Configure(EntityTypeBuilder<BookingClass> builder)
    {
        builder.ToTable("BookingClasses");
        
        builder.HasKey(b => b.Id);
        
        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.HasIndex(b => b.Code)
            .IsUnique();
            
        builder.HasData(
            new BookingClass { Id = 1, Name = "Economy", Code = "E", DisplayOrder = 1, IsActive = true },
            new BookingClass { Id = 2, Name = "Premium Economy", Code = "PE", DisplayOrder = 2, IsActive = true },
            new BookingClass { Id = 3, Name = "Business", Code = "B", DisplayOrder = 3, IsActive = true },
            new BookingClass { Id = 4, Name = "First Class", Code = "FC", DisplayOrder = 4, IsActive = true }
        );
    }
}
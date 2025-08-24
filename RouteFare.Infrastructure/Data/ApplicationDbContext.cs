using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Domain.Common;
using RouteFare.Domain.Entities;

namespace RouteFare.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUserService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUserService) 
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Route> Routes { get; set; }
    public DbSet<Season> Seasons { get; set; }
    public DbSet<TourOperator> TourOperators { get; set; }
    public DbSet<BookingClass> BookingClasses { get; set; }
    public DbSet<TourOperatorBookingClass> TourOperatorBookingClasses { get; set; }
    public DbSet<RouteBookingClass> RouteBookingClasses { get; set; }
    public DbSet<TourOperatorRoute> TourOperatorRoutes { get; set; }
    public DbSet<Pricing> Pricings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = "1", Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = "2", Name = "TourOperator", NormalizedName = "TOUROPERATOR" }
        );
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedBy = _currentUserService.UserId ?? "System";
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.ModifiedBy = _currentUserService.UserId ?? "System";
                    entry.Entity.ModifiedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
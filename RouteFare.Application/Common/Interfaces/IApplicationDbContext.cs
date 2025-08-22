using Microsoft.EntityFrameworkCore;
using RouteFare.Domain.Entities;

namespace RouteFare.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Route> Routes { get; set; }
    DbSet<Season> Seasons { get; set; }
    DbSet<TourOperator> TourOperators { get; set; }
    DbSet<BookingClass> BookingClasses { get; set; }
    DbSet<TourOperatorRoute> TourOperatorRoutes { get; set; }
    DbSet<TourOperatorBookingClass> TourOperatorBookingClasses { get; set; }
    DbSet<Pricing> Pricings { get; set; }
    
    DbSet<TEntity> Set<TEntity>() where TEntity : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
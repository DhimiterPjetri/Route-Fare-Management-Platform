using Microsoft.EntityFrameworkCore;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Interfaces;
using RouteFare.Infrastructure.Data;

namespace RouteFare.Infrastructure.Repositories;

public class PricingRepository : Repository<Pricing>, IPricingRepository
{
    public PricingRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Pricing>> GetByTourOperatorAndSeasonAsync(int tourOperatorId, int seasonId)
    {
        return await _dbSet
            .Include(p => p.Route)
            .Include(p => p.BookingClass)
            .Where(p => p.TourOperatorId == tourOperatorId && p.SeasonId == seasonId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Pricing>> GetByRouteAndSeasonAsync(int routeId, int seasonId)
    {
        return await _dbSet
            .Include(p => p.TourOperator)
            .Include(p => p.BookingClass)
            .Where(p => p.RouteId == routeId && p.SeasonId == seasonId)
            .ToListAsync();
    }

    public async Task<Pricing?> GetPricingAsync(int tourOperatorId, int routeId, int seasonId, int bookingClassId, DateTime date)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => 
                p.TourOperatorId == tourOperatorId &&
                p.RouteId == routeId &&
                p.SeasonId == seasonId &&
                p.BookingClassId == bookingClassId &&
                p.Date.Date == date.Date);
    }

    public async Task BulkUpdatePricingAsync(IEnumerable<Pricing> pricings)
    {
        _dbSet.UpdateRange(pricings);
        await Task.CompletedTask;
    }
}
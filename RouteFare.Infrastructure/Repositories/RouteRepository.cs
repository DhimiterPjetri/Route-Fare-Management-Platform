using Microsoft.EntityFrameworkCore;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Interfaces;
using RouteFare.Infrastructure.Data;

namespace RouteFare.Infrastructure.Repositories;

public class RouteRepository : Repository<Route>, IRouteRepository
{
    public RouteRepository(ApplicationDbContext context) : base(context) { }

    public override async Task<Route?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(r => r.RouteBookingClasses)
                .ThenInclude(rbc => rbc.BookingClass)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public override async Task<IEnumerable<Route>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.RouteBookingClasses)
                .ThenInclude(rbc => rbc.BookingClass)
            .ToListAsync();
    }

    public async Task<Route?> GetByCodeAsync(string code)
    {
        return await _dbSet
            .Include(r => r.RouteBookingClasses)
                .ThenInclude(rbc => rbc.BookingClass)
            .FirstOrDefaultAsync(r => r.RouteCode == code);
    }

    public async Task<IEnumerable<Route>> GetActiveRoutesAsync()
    {
        return await _dbSet
            .Include(r => r.RouteBookingClasses)
                .ThenInclude(rbc => rbc.BookingClass)
            .Where(r => r.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Route>> GetRoutesByTourOperatorAsync(int tourOperatorId)
    {
        return await _context.TourOperatorRoutes
            .Where(tr => tr.TourOperatorId == tourOperatorId && tr.IsActive)
            .Select(tr => tr.Route)
            .Distinct()
            .ToListAsync();
    }
}
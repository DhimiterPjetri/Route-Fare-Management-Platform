using Microsoft.EntityFrameworkCore;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Interfaces;
using RouteFare.Infrastructure.Data;

namespace RouteFare.Infrastructure.Repositories;

public class TourOperatorRepository : Repository<TourOperator>, ITourOperatorRepository
{
    public TourOperatorRepository(ApplicationDbContext context) : base(context) { }

    public async Task<TourOperator?> GetByCodeAsync(string code)
    {
        return await _dbSet.FirstOrDefaultAsync(t => t.Code == code);
    }

    public async Task<TourOperator?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(t => t.Users)
            .Include(t => t.BookingClasses)
                .ThenInclude(bc => bc.BookingClass)
            .Include(t => t.Routes)
                .ThenInclude(r => r.Route)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<TourOperator>> GetActiveTourOperatorsAsync()
    {
        return await _dbSet.Where(t => t.IsActive).ToListAsync();
    }
}
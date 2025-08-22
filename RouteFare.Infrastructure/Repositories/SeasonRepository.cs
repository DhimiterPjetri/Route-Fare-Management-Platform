using Microsoft.EntityFrameworkCore;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Enums;
using RouteFare.Domain.Interfaces;
using RouteFare.Infrastructure.Data;

namespace RouteFare.Infrastructure.Repositories;

public class SeasonRepository : Repository<Season>, ISeasonRepository
{
    public SeasonRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Season?> GetByYearAndTypeAsync(int year, SeasonType type)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.Year == year && s.Type == type);
    }

    public async Task<IEnumerable<Season>> GetActiveSeasonsByYearAsync(int year)
    {
        return await _dbSet.Where(s => s.Year == year && s.IsActive).ToListAsync();
    }

    public async Task<Season?> GetCurrentSeasonAsync()
    {
        var currentDate = DateTime.UtcNow;
        return await _dbSet
            .Where(s => s.StartDate <= currentDate && s.EndDate >= currentDate && s.IsActive)
            .FirstOrDefaultAsync();
    }
}
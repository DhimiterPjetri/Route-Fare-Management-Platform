using RouteFare.Domain.Entities;
using RouteFare.Domain.Enums;

namespace RouteFare.Domain.Interfaces;

public interface ISeasonRepository : IRepository<Season>
{
    Task<Season?> GetByYearAndTypeAsync(int year, SeasonType type);
    Task<IEnumerable<Season>> GetActiveSeasonsByYearAsync(int year);
    Task<Season?> GetCurrentSeasonAsync();
}
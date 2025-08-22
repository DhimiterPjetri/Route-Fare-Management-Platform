using RouteFare.Domain.Entities;

namespace RouteFare.Domain.Interfaces;

public interface IRouteRepository : IRepository<Route>
{
    Task<Route?> GetByCodeAsync(string code);
    Task<IEnumerable<Route>> GetActiveRoutesAsync();
    Task<IEnumerable<Route>> GetRoutesByTourOperatorAsync(int tourOperatorId);
}
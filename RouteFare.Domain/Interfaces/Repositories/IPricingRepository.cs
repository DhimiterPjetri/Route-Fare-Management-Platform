using RouteFare.Domain.Entities;

namespace RouteFare.Domain.Interfaces;

public interface IPricingRepository : IRepository<Pricing>
{
    Task<IEnumerable<Pricing>> GetByTourOperatorAndSeasonAsync(int tourOperatorId, int seasonId);
    Task<IEnumerable<Pricing>> GetByRouteAndSeasonAsync(int routeId, int seasonId);
    Task<Pricing?> GetPricingAsync(int tourOperatorId, int routeId, int seasonId, int bookingClassId, DateTime date);
    Task BulkUpdatePricingAsync(IEnumerable<Pricing> pricings);
}
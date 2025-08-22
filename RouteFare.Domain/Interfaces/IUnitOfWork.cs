namespace RouteFare.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRouteRepository Routes { get; }
    ISeasonRepository Seasons { get; }
    ITourOperatorRepository TourOperators { get; }
    IPricingRepository Pricings { get; }
    Task<int> SaveChangesAsync();
}
using RouteFare.Domain.Interfaces;
using RouteFare.Infrastructure.Data;

namespace RouteFare.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IRouteRepository? _routes;
    private ISeasonRepository? _seasons;
    private ITourOperatorRepository? _tourOperators;
    private IPricingRepository? _pricings;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRouteRepository Routes => _routes ??= new RouteRepository(_context);
    public ISeasonRepository Seasons => _seasons ??= new SeasonRepository(_context);
    public ITourOperatorRepository TourOperators => _tourOperators ??= new TourOperatorRepository(_context);
    public IPricingRepository Pricings => _pricings ??= new PricingRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
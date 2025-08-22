using RouteFare.Domain.Entities;

namespace RouteFare.Domain.Interfaces;

public interface ITourOperatorRepository : IRepository<TourOperator>
{
    Task<TourOperator?> GetByCodeAsync(string code);
    Task<TourOperator?> GetWithDetailsAsync(int id);
    Task<IEnumerable<TourOperator>> GetActiveTourOperatorsAsync();
}
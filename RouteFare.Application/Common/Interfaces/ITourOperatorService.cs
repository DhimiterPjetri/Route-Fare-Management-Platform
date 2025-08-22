using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.TourOperator;
using RouteFare.Application.DTOs.TourOperatorRoute;

namespace RouteFare.Application.Common.Interfaces;

public interface ITourOperatorService
{
    Task<Result<PagedResult<TourOperatorDto>>> GetTourOperatorsAsync(TourOperatorFilterDto filter);
    Task<Result<TourOperatorDto>> GetTourOperatorByIdAsync(int id);
    Task<Result<TourOperatorDto>> CreateTourOperatorAsync(CreateTourOperatorDto dto);
    Task<Result<TourOperatorDto>> UpdateTourOperatorAsync(UpdateTourOperatorDto dto);
    Task<Result<List<TourOperatorRouteDto>>> AssignRoutesToSeasonAsync(AssignRoutesToSeasonDto dto);
}
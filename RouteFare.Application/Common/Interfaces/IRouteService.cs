using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Route;

namespace RouteFare.Application.Common.Interfaces;

public interface IRouteService
{
    Task<Result<PagedResult<RouteDto>>> GetRoutesAsync(RouteFilterDto filter);
    Task<Result<RouteDto>> GetRouteByIdAsync(int id);
    Task<Result<RouteDto>> CreateRouteAsync(CreateRouteDto dto);
    Task<Result<RouteDto>> UpdateRouteAsync(UpdateRouteDto dto);
    Task<Result> DeleteRouteAsync(int id);
    Task<Result<List<RouteDto>>> GetAvailableRoutesAsync();
}
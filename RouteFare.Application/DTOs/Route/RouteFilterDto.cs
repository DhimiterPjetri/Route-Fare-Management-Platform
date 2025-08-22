using RouteFare.Application.Common.Models;

namespace RouteFare.Application.DTOs.Route;

public class RouteFilterDto : PaginationParams
{
    public bool? IsActive { get; set; }
    public string? Origin { get; set; }
    public string? Destination { get; set; }
}
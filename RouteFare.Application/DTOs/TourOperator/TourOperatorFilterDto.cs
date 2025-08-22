using RouteFare.Application.Common.Models;

namespace RouteFare.Application.DTOs.TourOperator;

public class TourOperatorFilterDto : PaginationParams
{
    public bool? IsActive { get; set; }
    public string? Code { get; set; }
}
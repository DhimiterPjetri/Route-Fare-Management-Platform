using RouteFare.Application.Common.Models;
using RouteFare.Domain.Enums;

namespace RouteFare.Application.DTOs.Season;

public class SeasonFilterDto : PaginationParams
{
    public int? Year { get; set; }
    public bool? IsActive { get; set; }
    public SeasonType? Type { get; set; }
}
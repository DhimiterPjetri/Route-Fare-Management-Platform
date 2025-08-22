using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Season;

namespace RouteFare.Application.Common.Interfaces;

public interface ISeasonService
{
    Task<Result<PagedResult<SeasonDto>>> GetSeasonsAsync(SeasonFilterDto filter);
    Task<Result<SeasonDto>> GetSeasonByIdAsync(int id);
    Task<Result<List<SeasonDto>>> CreateSeasonsForYearAsync(CreateSeasonDto dto);
    Task<Result<SeasonDto>> UpdateSeasonAsync(UpdateSeasonDto dto);
    Task<Result<SeasonDto>> GetCurrentSeasonAsync();
    Task<Result<List<SeasonDto>>> GetActiveSeasonsAsync();
}
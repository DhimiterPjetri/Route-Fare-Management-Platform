using AutoMapper;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Season;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Enums;
using RouteFare.Domain.Interfaces;

namespace RouteFare.Application.Services;

public class SeasonService : ISeasonService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public SeasonService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedResult<SeasonDto>>> GetSeasonsAsync(SeasonFilterDto filter)
    {
        var query = await _unitOfWork.Seasons.GetAllAsync();

        // Apply filters
        if (filter.Year.HasValue)
            query = query.Where(s => s.Year == filter.Year.Value);
        
        if (filter.IsActive.HasValue)
            query = query.Where(s => s.IsActive == filter.IsActive.Value);
        
        if (filter.Type.HasValue)
            query = query.Where(s => s.Type == filter.Type.Value);
        
        if (!string.IsNullOrEmpty(filter.SearchTerm))
            query = query.Where(s => s.Name.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase));

        // Sorting
        query = filter.SortBy?.ToLower() switch
        {
            "year" => filter.SortDescending ? query.OrderByDescending(s => s.Year) : query.OrderBy(s => s.Year),
            "type" => filter.SortDescending ? query.OrderByDescending(s => s.Type) : query.OrderBy(s => s.Type),
            "startdate" => filter.SortDescending ? query.OrderByDescending(s => s.StartDate) : query.OrderBy(s => s.StartDate),
            _ => filter.SortDescending ? query.OrderByDescending(s => s.Id) : query.OrderBy(s => s.Id)
        };

        // Pagination
        var totalCount = query.Count();
        var items = query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var seasonDtos = _mapper.Map<List<SeasonDto>>(items);
        var pagedResult = new PagedResult<SeasonDto>(seasonDtos, totalCount, filter.PageNumber, filter.PageSize);
        
        return Result<PagedResult<SeasonDto>>.Success(pagedResult);
    }

    public async Task<Result<SeasonDto>> GetSeasonByIdAsync(int id)
    {
        var season = await _unitOfWork.Seasons.GetByIdAsync(id);
        if (season == null)
            return Result<SeasonDto>.Failure("Season not found");

        var seasonDto = _mapper.Map<SeasonDto>(season);
        return Result<SeasonDto>.Success(seasonDto);
    }

    public async Task<Result<List<SeasonDto>>> CreateSeasonsForYearAsync(CreateSeasonDto dto)
    {
        // Admin only
        if (!_currentUser.IsAdmin)
            return Result<List<SeasonDto>>.Failure("Unauthorized");

        // Check if seasons already exist for this year
        var existingWinter = await _unitOfWork.Seasons.GetByYearAndTypeAsync(dto.Year, SeasonType.Winter);
        var existingSummer = await _unitOfWork.Seasons.GetByYearAndTypeAsync(dto.Year, SeasonType.Summer);

        if (existingWinter != null || existingSummer != null)
            return Result<List<SeasonDto>>.Failure($"Seasons already exist for year {dto.Year}");

        var seasons = new List<Season>();

        // Create Winter season (Jan 1 - Jun 30)
        var winterSeason = new Season
        {
            Year = dto.Year,
            Type = SeasonType.Winter,
            Name = $"Winter {dto.Year}",
            StartDate = new DateTime(dto.Year, 1, 1),
            EndDate = new DateTime(dto.Year, 6, 30),
            IsActive = dto.IsActive
        };
        seasons.Add(winterSeason);

        // Create Summer season (Jul 1 - Dec 31)
        var summerSeason = new Season
        {
            Year = dto.Year,
            Type = SeasonType.Summer,
            Name = $"Summer {dto.Year}",
            StartDate = new DateTime(dto.Year, 7, 1),
            EndDate = new DateTime(dto.Year, 12, 31),
            IsActive = dto.IsActive
        };
        seasons.Add(summerSeason);

        foreach (var season in seasons)
        {
            await _unitOfWork.Seasons.AddAsync(season);
        }
        
        await _unitOfWork.SaveChangesAsync();

        var seasonDtos = _mapper.Map<List<SeasonDto>>(seasons);
        return Result<List<SeasonDto>>.Success(seasonDtos);
    }

    public async Task<Result<SeasonDto>> UpdateSeasonAsync(UpdateSeasonDto dto)
    {
        // Admin only
        if (!_currentUser.IsAdmin)
            return Result<SeasonDto>.Failure("Unauthorized");

        var season = await _unitOfWork.Seasons.GetByIdAsync(dto.Id);
        if (season == null)
            return Result<SeasonDto>.Failure("Season not found");

        season.IsActive = dto.IsActive;
        await _unitOfWork.Seasons.UpdateAsync(season);
        await _unitOfWork.SaveChangesAsync();

        var seasonDto = _mapper.Map<SeasonDto>(season);
        return Result<SeasonDto>.Success(seasonDto);
    }

    public async Task<Result<SeasonDto>> GetCurrentSeasonAsync()
    {
        var currentSeason = await _unitOfWork.Seasons.GetCurrentSeasonAsync();
        if (currentSeason == null)
            return Result<SeasonDto>.Failure("No active season found for current date");

        var seasonDto = _mapper.Map<SeasonDto>(currentSeason);
        return Result<SeasonDto>.Success(seasonDto);
    }

    public async Task<Result<List<SeasonDto>>> GetActiveSeasonsAsync()
    {
        var currentYear = DateTime.UtcNow.Year;
        var seasons = await _unitOfWork.Seasons.GetActiveSeasonsByYearAsync(currentYear);
        
        if (DateTime.UtcNow.Month >= 10)
        {
            var nextYearSeasons = await _unitOfWork.Seasons.GetActiveSeasonsByYearAsync(currentYear + 1);
            seasons = seasons.Concat(nextYearSeasons);
        }

        var seasonDtos = _mapper.Map<List<SeasonDto>>(seasons);
        return Result<List<SeasonDto>>.Success(seasonDtos);
    }
}
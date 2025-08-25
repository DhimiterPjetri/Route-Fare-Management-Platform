using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.Season;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SeasonsController : ControllerBase
{
    private readonly ISeasonService _seasonService;

    public SeasonsController(ISeasonService seasonService)
    {
        _seasonService = seasonService;
    }

    /// <summary>
    /// Get seasons with optional filtering and pagination
    /// </summary>
    /// <param name="filter">Season filter and pagination parameters</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<SeasonDto>), 200)]
    public async Task<IActionResult> GetSeasons([FromQuery] SeasonFilterDto filter)
    {
        var result = await _seasonService.GetSeasonsAsync(filter);
        return Ok(result.Data);
    }

    /// <summary>
    /// Get season by ID
    /// </summary>
    /// <param name="id">Season ID</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SeasonDto), 200)]
    public async Task<IActionResult> GetSeason(int id)
    {
        var result = await _seasonService.GetSeasonByIdAsync(id);
        return Ok(result.Data);
    }

    /// <summary>
    /// Get the current active season
    /// </summary>
    [HttpGet("current")]
    [ProducesResponseType(typeof(SeasonDto), 200)]
    public async Task<IActionResult> GetCurrentSeason()
    {
        var result = await _seasonService.GetCurrentSeasonAsync();
        return Ok(result.Data);
    }

    /// <summary>
    /// Get all active seasons
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<SeasonDto>), 200)]
    public async Task<IActionResult> GetActiveSeasons()
    {
        var result = await _seasonService.GetActiveSeasonsAsync();
        return Ok(result.Data);
    }

    /// <summary>
    /// Create seasons for a specific year (Admin only)
    /// </summary>
    /// <param name="dto">Season creation data</param>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<SeasonDto>), 200)]
    public async Task<IActionResult> CreateSeasons([FromBody] CreateSeasonDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _seasonService.CreateSeasonsForYearAsync(dto);
        return Ok(result.Data);
    }

    /// <summary>
    /// Update existing season (Admin only)
    /// </summary>
    /// <param name="id">Season ID</param>
    /// <param name="dto">Season update data</param>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(SeasonDto), 200)]
    public async Task<IActionResult> UpdateSeason(int id, [FromBody] UpdateSeasonDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Season ID mismatch");

        var result = await _seasonService.UpdateSeasonAsync(dto);
        return Ok(result.Data);
    }
}
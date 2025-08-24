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

    [HttpGet]
    public async Task<IActionResult> GetSeasons([FromQuery] SeasonFilterDto filter)
    {
        var result = await _seasonService.GetSeasonsAsync(filter);
        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSeason(int id)
    {
        var result = await _seasonService.GetSeasonByIdAsync(id);
        return Ok(result.Data);
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentSeason()
    {
        var result = await _seasonService.GetCurrentSeasonAsync();
        return Ok(result.Data);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSeasons()
    {
        var result = await _seasonService.GetActiveSeasonsAsync();
        return Ok(result.Data);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSeasons([FromBody] CreateSeasonDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _seasonService.CreateSeasonsForYearAsync(dto);
        return Ok(result.Data);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSeason(int id, [FromBody] UpdateSeasonDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Season ID mismatch");

        var result = await _seasonService.UpdateSeasonAsync(dto);
        return Ok(result.Data);
    }
}
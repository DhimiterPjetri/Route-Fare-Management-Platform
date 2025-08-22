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
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSeason(int id)
    {
        var result = await _seasonService.GetSeasonByIdAsync(id);
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.Error);
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentSeason()
    {
        var result = await _seasonService.GetCurrentSeasonAsync();
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.Error);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveSeasons()
    {
        var result = await _seasonService.GetActiveSeasonsAsync();
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSeasons([FromBody] CreateSeasonDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _seasonService.CreateSeasonsForYearAsync(dto);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSeason(int id, [FromBody] UpdateSeasonDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Season ID mismatch");

        var result = await _seasonService.UpdateSeasonAsync(dto);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }
}
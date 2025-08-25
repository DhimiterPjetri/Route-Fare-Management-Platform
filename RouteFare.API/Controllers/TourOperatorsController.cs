using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.TourOperator;
using RouteFare.Application.DTOs.TourOperatorRoute;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TourOperatorsController : ControllerBase
{
    private readonly ITourOperatorService _tourOperatorService;

    public TourOperatorsController(ITourOperatorService tourOperatorService)
    {
        _tourOperatorService = tourOperatorService;
    }

    /// <summary>
    /// Get tour operators with optional filtering and pagination
    /// </summary>
    /// <param name="filter">Tour operator filter and pagination parameters</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<TourOperatorDto>), 200)]
    public async Task<IActionResult> GetTourOperators([FromQuery] TourOperatorFilterDto filter)
    {
        var result = await _tourOperatorService.GetTourOperatorsAsync(filter);
        return Ok(result.Data);
    }

    /// <summary>
    /// Get tour operator by ID
    /// </summary>
    /// <param name="id">Tour operator ID</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TourOperatorDto), 200)]
    public async Task<IActionResult> GetTourOperator(int id)
    {
        var result = await _tourOperatorService.GetTourOperatorByIdAsync(id);
        return Ok(result.Data);
    }

    /// <summary>
    /// Create new tour operator (Admin only)
    /// </summary>
    /// <param name="dto">Tour operator creation data</param>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(TourOperatorDto), 201)]
    public async Task<IActionResult> CreateTourOperator([FromBody] CreateTourOperatorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tourOperatorService.CreateTourOperatorAsync(dto);
        return CreatedAtAction(nameof(GetTourOperator), new { id = result.Data?.Id }, result.Data);
    }

    /// <summary>
    /// Update tour operator details
    /// </summary>
    /// <param name="id">Tour operator ID</param>
    /// <param name="dto">Tour operator update data</param>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TourOperatorDto), 200)]
    public async Task<IActionResult> UpdateTourOperator(int id, [FromBody] UpdateTourOperatorDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Tour Operator ID mismatch");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tourOperatorService.UpdateTourOperatorAsync(dto);
        return Ok(result.Data);
    }

    /// <summary>
    /// Assign routes to tour operator for specific season
    /// </summary>
    /// <param name="dto">Route assignment data</param>
    [HttpPost("assign-routes")]
    [ProducesResponseType(typeof(List<TourOperatorRouteDto>), 200)]
    public async Task<IActionResult> AssignRoutesToSeason([FromBody] AssignRoutesToSeasonDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tourOperatorService.AssignRoutesToSeasonAsync(dto);
        return Ok(result.Data);
    }
}
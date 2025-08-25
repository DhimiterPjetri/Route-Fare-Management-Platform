using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.Route;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly IRouteService _routeService;

    public RoutesController(IRouteService routeService)
    {
        _routeService = routeService;
    }

    /// <summary>
    /// Get routes with optional filtering and pagination
    /// </summary>
    /// <param name="filter">Route filter and pagination parameters</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<RouteDto>), 200)]
    public async Task<IActionResult> GetRoutes([FromQuery] RouteFilterDto filter)
    {
        var result = await _routeService.GetRoutesAsync(filter);
        return Ok(result.Data);
    }

    /// <summary>
    /// Get route by ID
    /// </summary>
    /// <param name="id">Route ID</param>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RouteDto), 200)]
    public async Task<IActionResult> GetRoute(int id)
    {
        var result = await _routeService.GetRouteByIdAsync(id);
        return Ok(result.Data);
    }

    /// <summary>
    /// Get all available routes for tour operator assignment
    /// </summary>
    [HttpGet("available")]
    [ProducesResponseType(typeof(List<RouteDto>), 200)]
    public async Task<IActionResult> GetAvailableRoutes()
    {
        var result = await _routeService.GetAvailableRoutesAsync();
        return Ok(result.Data);
    }

    /// <summary>
    /// Create new route (Admin only)
    /// </summary>
    /// <param name="dto">Route creation data</param>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(RouteDto), 201)]
    public async Task<IActionResult> CreateRoute([FromBody] CreateRouteDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _routeService.CreateRouteAsync(dto);
        return CreatedAtAction(nameof(GetRoute), new { id = result.Data?.Id }, result.Data);
    }

    /// <summary>
    /// Update existing route (Admin only)
    /// </summary>
    /// <param name="id">Route ID</param>
    /// <param name="dto">Route update data</param>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(RouteDto), 200)]
    public async Task<IActionResult> UpdateRoute(int id, [FromBody] UpdateRouteDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Route ID mismatch");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _routeService.UpdateRouteAsync(dto);
        return Ok(result.Data);
    }

    /// <summary>
    /// Delete route (Admin only)
    /// </summary>
    /// <param name="id">Route ID</param>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> DeleteRoute(int id)
    {
        await _routeService.DeleteRouteAsync(id);
        return NoContent();
    }
}
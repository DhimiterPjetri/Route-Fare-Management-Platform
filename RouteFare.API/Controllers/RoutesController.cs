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

    [HttpGet]
    public async Task<IActionResult> GetRoutes([FromQuery] RouteFilterDto filter)
    {
        var result = await _routeService.GetRoutesAsync(filter);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoute(int id)
    {
        var result = await _routeService.GetRouteByIdAsync(id);
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.Error);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableRoutes()
    {
        var result = await _routeService.GetAvailableRoutesAsync();
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateRoute([FromBody] CreateRouteDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _routeService.CreateRouteAsync(dto);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetRoute), new { id = result.Data?.Id }, result.Data)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRoute(int id, [FromBody] UpdateRouteDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Route ID mismatch");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _routeService.UpdateRouteAsync(dto);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRoute(int id)
    {
        var result = await _routeService.DeleteRouteAsync(id);
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}
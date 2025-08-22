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

    [HttpGet]
    public async Task<IActionResult> GetTourOperators([FromQuery] TourOperatorFilterDto filter)
    {
        var result = await _tourOperatorService.GetTourOperatorsAsync(filter);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTourOperator(int id)
    {
        var result = await _tourOperatorService.GetTourOperatorByIdAsync(id);
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.Error);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTourOperator([FromBody] CreateTourOperatorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tourOperatorService.CreateTourOperatorAsync(dto);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetTourOperator), new { id = result.Data?.Id }, result.Data)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTourOperator(int id, [FromBody] UpdateTourOperatorDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Tour Operator ID mismatch");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tourOperatorService.UpdateTourOperatorAsync(dto);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpPost("assign-routes")]
    public async Task<IActionResult> AssignRoutesToSeason([FromBody] AssignRoutesToSeasonDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tourOperatorService.AssignRoutesToSeasonAsync(dto);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }
}
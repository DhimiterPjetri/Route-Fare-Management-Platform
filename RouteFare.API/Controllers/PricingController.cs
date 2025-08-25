using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.Pricing;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly IPricingService _pricingService;

    public PricingController(IPricingService pricingService)
    {
        _pricingService = pricingService;
    }

    /// <summary>
    /// Get pricing data with optional filtering and pagination
    /// </summary>
    /// <param name="filter">Pricing filter and pagination parameters</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<PricingDto>), 200)]
    public async Task<IActionResult> GetPricings([FromQuery] PricingFilterDto filter)
    {
        var result = await _pricingService.GetPricingsAsync(filter);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    /// <summary>
    /// Get pricing table for a specific tour operator route
    /// </summary>
    /// <param name="tourOperatorRouteId">Tour operator route ID</param>
    [HttpGet("table/{tourOperatorRouteId}")]
    [ProducesResponseType(typeof(PricingTableDto), 200)]
    public async Task<IActionResult> GetPricingTable(int tourOperatorRouteId)
    {
        var result = await _pricingService.GetPricingTableAsync(tourOperatorRouteId);
        return Ok(result.Data);
    }

    /// <summary>
    /// Get pricing data for a specific date range
    /// </summary>
    /// <param name="tourOperatorId">Tour operator ID</param>
    /// <param name="routeId">Route ID</param>
    /// <param name="startDate">Start date for pricing data</param>
    /// <param name="endDate">End date for pricing data</param>
    [HttpGet("date-range")]
    [ProducesResponseType(typeof(List<PricingDto>), 200)]
    public async Task<IActionResult> GetPricingByDateRange(
        [FromQuery] int tourOperatorId,
        [FromQuery] int routeId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await _pricingService.GetPricingByDateRangeAsync(tourOperatorId, routeId, startDate, endDate);
        return Ok(result.Data);
    }

    /// <summary>
    /// Update pricing for a specific date and booking class
    /// </summary>
    /// <param name="dto">Pricing update data</param>
    [HttpPut]
    [Authorize(Roles = "TourOperator")]
    [ProducesResponseType(typeof(string), 200)]
    public async Task<IActionResult> UpdatePricing([FromBody] UpdatePricingDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _pricingService.UpdatePricingAsync(dto);
        return Ok("Pricing updated successfully");
    }

    /// <summary>
    /// Bulk update pricing for multiple dates/booking classes
    /// </summary>
    /// <param name="dto">Bulk pricing update data</param>
    [HttpPut("bulk")]
    [Authorize(Roles = "TourOperator")]
    [ProducesResponseType(typeof(string), 200)]
    public async Task<IActionResult> BulkUpdatePricing([FromBody] BulkPricingUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _pricingService.BulkUpdatePricingAsync(dto);
        return Ok("Bulk pricing update successful");
    }
}
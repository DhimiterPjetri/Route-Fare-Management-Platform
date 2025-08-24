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

    [HttpGet]
    public async Task<IActionResult> GetPricings([FromQuery] PricingFilterDto filter)
    {
        var result = await _pricingService.GetPricingsAsync(filter);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    [HttpGet("table/{tourOperatorRouteId}")]
    public async Task<IActionResult> GetPricingTable(int tourOperatorRouteId)
    {
        var result = await _pricingService.GetPricingTableAsync(tourOperatorRouteId);
        return Ok(result.Data);
    }

    [HttpGet("date-range")]
    public async Task<IActionResult> GetPricingByDateRange(
        [FromQuery] int tourOperatorId,
        [FromQuery] int routeId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await _pricingService.GetPricingByDateRangeAsync(tourOperatorId, routeId, startDate, endDate);
        return Ok(result.Data);
    }

    [HttpPut]
    [Authorize(Roles = "TourOperator")]
    public async Task<IActionResult> UpdatePricing([FromBody] UpdatePricingDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _pricingService.UpdatePricingAsync(dto);
        return Ok("Pricing updated successfully");
    }

    [HttpPut("bulk")]
    [Authorize(Roles = "TourOperator")]
    public async Task<IActionResult> BulkUpdatePricing([FromBody] BulkPricingUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _pricingService.BulkUpdatePricingAsync(dto);
        return Ok("Bulk pricing update successful");
    }
}
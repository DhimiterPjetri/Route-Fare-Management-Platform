using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.TourOperatorRoute;
using RouteFare.Domain.Entities;
using AutoMapper;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TourOperatorRoutesController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public TourOperatorRoutesController(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _context = context;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetTourOperatorRoutes([FromQuery] int? tourOperatorId, [FromQuery] int? seasonId)
    {
        var query = _context.Set<TourOperatorRoute>()
            .Include(tr => tr.TourOperator)
            .Include(tr => tr.Route)
            .Include(tr => tr.Season)
            .AsQueryable();

        // Apply authorization filter
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId.HasValue)
        {
            query = query.Where(tr => tr.TourOperatorId == _currentUser.TourOperatorId.Value);
        }
        else if (tourOperatorId.HasValue)
        {
            query = query.Where(tr => tr.TourOperatorId == tourOperatorId.Value);
        }

        if (seasonId.HasValue)
        {
            query = query.Where(tr => tr.SeasonId == seasonId.Value);
        }

        var tourOperatorRoutes = await query
            .OrderBy(tr => tr.Season.StartDate)
            .ThenBy(tr => tr.Route.RouteCode)
            .ToListAsync();

        var dtos = _mapper.Map<List<TourOperatorRouteDto>>(tourOperatorRoutes);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTourOperatorRoute(int id)
    {
        var tourOperatorRoute = await _context.Set<TourOperatorRoute>()
            .Include(tr => tr.TourOperator)
            .Include(tr => tr.Route)
            .Include(tr => tr.Season)
            .FirstOrDefaultAsync(tr => tr.Id == id);

        if (tourOperatorRoute == null)
            return NotFound("Tour operator route not found");

        // Check authorization
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            return Forbid();

        var dto = _mapper.Map<TourOperatorRouteDto>(tourOperatorRoute);
        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveTourOperatorRoute(int id)
    {
        var tourOperatorRoute = await _context.Set<TourOperatorRoute>()
            .Include(tr => tr.Season)
            .FirstOrDefaultAsync(tr => tr.Id == id);

        if (tourOperatorRoute == null)
            return NotFound("Tour operator route not found");

        // Check authorization
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            return Forbid();

        var today = DateTime.UtcNow.Date;
        if (tourOperatorRoute.Season.StartDate <= today && tourOperatorRoute.Season.EndDate >= today)
            return BadRequest("Cannot remove routes from seasons that are currently active");

        var pricings = await _context.Set<Pricing>()
            .Where(p => p.TourOperatorRouteId == id)
            .ToListAsync();

        _context.Set<Pricing>().RemoveRange(pricings);
        _context.Set<TourOperatorRoute>().Remove(tourOperatorRoute);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
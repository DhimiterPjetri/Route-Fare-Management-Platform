using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.TourOperatorRoute;
using RouteFare.Domain.Entities;
using AutoMapper;
using RouteFare.Application.Common.Exceptions;

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
    public async Task<IActionResult> GetTourOperatorRoutes([FromQuery] int? tourOperatorId, [FromQuery] int? seasonId, [FromQuery] int? routeId)
    {
        var query = _context.Set<TourOperatorRoute>()
            .Include(tr => tr.TourOperator)
            .Include(tr => tr.Route)
                .ThenInclude(r => r.RouteBookingClasses)
                    .ThenInclude(rbc => rbc.BookingClass)
            .Include(tr => tr.Season)
            .AsQueryable();

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

        if (routeId.HasValue)
        {
            query = query.Where(tr => tr.RouteId == routeId.Value);
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
                .ThenInclude(r => r.RouteBookingClasses)
                    .ThenInclude(rbc => rbc.BookingClass)
            .Include(tr => tr.Season)
            .FirstOrDefaultAsync(tr => tr.Id == id);

        if (tourOperatorRoute == null)
            throw new NotFoundException("Tour operator route not found");

        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            throw new ForbiddenException("You can only access your own routes");

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
            throw new NotFoundException("Tour operator route not found");

        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            throw new ForbiddenException("You can only remove your own routes");

        var today = DateTime.UtcNow.Date;
        if (tourOperatorRoute.Season.StartDate <= today && tourOperatorRoute.Season.EndDate >= today)
            throw new BusinessException("Cannot remove routes from seasons that are currently active");

        var pricings = await _context.Set<Pricing>()
            .Where(p => p.TourOperatorRouteId == id)
            .ToListAsync();

        _context.Set<Pricing>().RemoveRange(pricings);
        _context.Set<TourOperatorRoute>().Remove(tourOperatorRoute);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
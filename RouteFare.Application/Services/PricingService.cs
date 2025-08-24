using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Pricing;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Interfaces;
using RouteFare.Application.Common.Exceptions;

namespace RouteFare.Application.Services;

public class PricingService : IPricingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbContext _context;

    public PricingService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUser,
        IApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<PricingTableDto>> GetPricingTableAsync(int tourOperatorRouteId)
    {
        var tourOperatorRoute = await _context.Set<TourOperatorRoute>()
            .Include(tr => tr.TourOperator)
            .Include(tr => tr.Route)
            .Include(tr => tr.Season)
            .FirstOrDefaultAsync(tr => tr.Id == tourOperatorRouteId);

        if (tourOperatorRoute == null)
            throw new NotFoundException("Tour operator route not found");

        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            throw new UnauthorizedException("Unauthorized to access this pricing data");

        var pricings = await _context.Set<Pricing>()
            .Include(p => p.BookingClass)
            .Where(p => p.TourOperatorRouteId == tourOperatorRouteId)
            .OrderBy(p => p.Date)
            .ThenBy(p => p.BookingClass.DisplayOrder)
            .ToListAsync();

        var pricingRows = pricings
            .GroupBy(p => p.Date)
            .Select(g => new PricingRowDto
            {
                Date = g.Key,
                DayOfWeek = g.Key.DayOfWeek.ToString(),
                ClassPricing = g.Select(p => new ClassPricingDto
                {
                    BookingClassId = p.BookingClassId,
                    BookingClassName = p.BookingClass.Name,
                    BookingClassCode = p.BookingClass.Code,
                    Price = p.Price,
                    RequestedSeats = p.RequestedSeats
                }).ToList()
            })
            .ToList();

        var result = new PricingTableDto
        {
            TourOperatorId = tourOperatorRoute.TourOperatorId,
            TourOperatorName = tourOperatorRoute.TourOperator.Name,
            RouteId = tourOperatorRoute.RouteId,
            RouteCode = tourOperatorRoute.Route.RouteCode,
            SeasonId = tourOperatorRoute.SeasonId,
            SeasonName = tourOperatorRoute.Season.Name,
            Rows = pricingRows
        };

        return Result<PricingTableDto>.Success(result);
    }

    public async Task<Result<PagedResult<PricingDto>>> GetPricingsAsync(PricingFilterDto filter)
    {
        var query = _context.Set<Pricing>()
            .Include(p => p.TourOperator)
            .Include(p => p.Route)
            .Include(p => p.Season)
            .Include(p => p.BookingClass)
            .AsQueryable();

        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId.HasValue)
        {
            query = query.Where(p => p.TourOperatorId == _currentUser.TourOperatorId.Value);
        }

        if (filter.TourOperatorId.HasValue)
            query = query.Where(p => p.TourOperatorId == filter.TourOperatorId.Value);

        if (filter.RouteId.HasValue)
            query = query.Where(p => p.RouteId == filter.RouteId.Value);

        if (filter.SeasonId.HasValue)
            query = query.Where(p => p.SeasonId == filter.SeasonId.Value);

        if (filter.StartDate.HasValue)
            query = query.Where(p => p.Date >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(p => p.Date <= filter.EndDate.Value);

        query = filter.SortBy?.ToLower() switch
        {
            "date" => filter.SortDescending ? query.OrderByDescending(p => p.Date) : query.OrderBy(p => p.Date),
            "price" => filter.SortDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            _ => query.OrderBy(p => p.Date).ThenBy(p => p.BookingClass.DisplayOrder)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var dtos = _mapper.Map<List<PricingDto>>(items);
        var pagedResult = new PagedResult<PricingDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);

        return Result<PagedResult<PricingDto>>.Success(pagedResult);
    }

    public async Task<Result> UpdatePricingAsync(UpdatePricingDto dto)
    {
        var tourOperatorRoute = await _context.Set<TourOperatorRoute>()
            .FirstOrDefaultAsync(tr => tr.Id == dto.TourOperatorRouteId);

        if (tourOperatorRoute == null)
            throw new NotFoundException("Tour operator route not found");

        if (_currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            throw new UnauthorizedException("Unauthorized to update pricing");

        foreach (var update in dto.Updates)
        {
            var pricing = await _unitOfWork.Pricings.GetPricingAsync(
                tourOperatorRoute.TourOperatorId,
                tourOperatorRoute.RouteId,
                tourOperatorRoute.SeasonId,
                update.BookingClassId,
                update.Date);

            if (pricing != null)
            {
                pricing.Price = update.Price;
                pricing.RequestedSeats = update.RequestedSeats;
                await _unitOfWork.Pricings.UpdateAsync(pricing);
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> BulkUpdatePricingAsync(BulkPricingUpdateDto dto)
    {
        var tourOperatorRoute = await _context.Set<TourOperatorRoute>()
            .Include(tr => tr.Season)
            .FirstOrDefaultAsync(tr => tr.Id == dto.TourOperatorRouteId);

        if (tourOperatorRoute == null)
            throw new NotFoundException("Tour operator route not found");

        if (_currentUser.TourOperatorId != tourOperatorRoute.TourOperatorId)
            throw new UnauthorizedException("Unauthorized to update pricing");

        var pricingsQuery = _context.Set<Pricing>()
            .Where(p => p.TourOperatorRouteId == dto.TourOperatorRouteId);

        switch (dto.UpdateType)
        {
            case BulkUpdateType.SpecificDaysOfWeek:
                if (dto.DaysOfWeek != null && dto.DaysOfWeek.Any())
                {
                    pricingsQuery = pricingsQuery.Where(p => dto.DaysOfWeek.Contains(p.DayOfWeek));
                }
                break;

            case BulkUpdateType.DateRange:
                if (dto.StartDate.HasValue)
                    pricingsQuery = pricingsQuery.Where(p => p.Date >= dto.StartDate.Value);
                if (dto.EndDate.HasValue)
                    pricingsQuery = pricingsQuery.Where(p => p.Date <= dto.EndDate.Value);
                break;

            case BulkUpdateType.AllDays:
                break;
        }

        var pricingsToUpdate = await pricingsQuery.ToListAsync();

        foreach (var pricing in pricingsToUpdate)
        {
            if (dto.ClassPrices.TryGetValue(pricing.BookingClassId, out var price))
            {
                pricing.Price = price;
            }

            if (dto.ClassSeats.TryGetValue(pricing.BookingClassId, out var seats))
            {
                pricing.RequestedSeats = seats;
            }
        }

        await _context.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<List<PricingDto>>> GetPricingByDateRangeAsync(
        int tourOperatorId,
        int routeId,
        DateTime startDate,
        DateTime endDate)
    {
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorId)
            throw new UnauthorizedException("Unauthorized to access this pricing data");

        var pricings = await _context.Set<Pricing>()
            .Include(p => p.TourOperator)
            .Include(p => p.Route)
            .Include(p => p.Season)
            .Include(p => p.BookingClass)
            .Where(p => p.TourOperatorId == tourOperatorId
                     && p.RouteId == routeId
                     && p.Date >= startDate
                     && p.Date <= endDate)
            .OrderBy(p => p.Date)
            .ThenBy(p => p.BookingClass.DisplayOrder)
            .ToListAsync();

        var dtos = _mapper.Map<List<PricingDto>>(pricings);
        return Result<List<PricingDto>>.Success(dtos);
    }
}
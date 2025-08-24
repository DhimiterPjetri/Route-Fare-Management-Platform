using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.Route;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Interfaces;
using RouteFare.Application.Common.Exceptions;

namespace RouteFare.Application.Services;

public class RouteService : IRouteService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public RouteService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedResult<RouteDto>>> GetRoutesAsync(RouteFilterDto filter)
    {
        var query = await _unitOfWork.Routes.GetAllAsync();
        
        if (filter.IsActive.HasValue)
            query = query.Where(r => r.IsActive == filter.IsActive.Value);
        
        if (!string.IsNullOrEmpty(filter.Origin))
            query = query.Where(r => r.Origin.Contains(filter.Origin, StringComparison.OrdinalIgnoreCase));
        
        if (!string.IsNullOrEmpty(filter.Destination))
            query = query.Where(r => r.Destination.Contains(filter.Destination, StringComparison.OrdinalIgnoreCase));
        
        if (!string.IsNullOrEmpty(filter.SearchTerm))
            query = query.Where(r => 
                r.RouteCode.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                r.Origin.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                r.Destination.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase));

        query = filter.SortBy?.ToLower() switch
        {
            "origin" => filter.SortDescending ? query.OrderByDescending(r => r.Origin) : query.OrderBy(r => r.Origin),
            "destination" => filter.SortDescending ? query.OrderByDescending(r => r.Destination) : query.OrderBy(r => r.Destination),
            "code" => filter.SortDescending ? query.OrderByDescending(r => r.RouteCode) : query.OrderBy(r => r.RouteCode),
            _ => filter.SortDescending ? query.OrderByDescending(r => r.Id) : query.OrderBy(r => r.Id)
        };

        var totalCount = query.Count();
        var items = query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var routeDtos = _mapper.Map<List<RouteDto>>(items);
        var pagedResult = new PagedResult<RouteDto>(routeDtos, totalCount, filter.PageNumber, filter.PageSize);
        
        return Result<PagedResult<RouteDto>>.Success(pagedResult);
    }

    public async Task<Result<RouteDto>> GetRouteByIdAsync(int id)
    {
        var route = await _unitOfWork.Routes.GetByIdAsync(id);
        if (route == null)
            throw new NotFoundException("Route not found");

        var routeDto = _mapper.Map<RouteDto>(route);
        return Result<RouteDto>.Success(routeDto);
    }

    public async Task<Result<RouteDto>> CreateRouteAsync(CreateRouteDto dto)
    {
        if (!_currentUser.IsAdmin)
            throw new UnauthorizedException("Only administrators can create routes");

        if (!dto.BookingClassIds.Any())
            throw new ValidationException("At least one booking class must be selected");

        var routeCode = string.IsNullOrEmpty(dto.RouteCode) 
            ? $"{dto.Origin.Substring(0, Math.Min(3, dto.Origin.Length)).ToUpper()}-{dto.Destination.Substring(0, Math.Min(3, dto.Destination.Length)).ToUpper()}"
            : dto.RouteCode;

        var existingRoute = await _unitOfWork.Routes.GetByCodeAsync(routeCode);
        if (existingRoute != null)
            throw new BusinessException("Route code already exists");

        var route = _mapper.Map<Route>(dto);
        route.RouteCode = routeCode;

        route.RouteBookingClasses = dto.BookingClassIds.Select(bcId => new RouteBookingClass
        {
            BookingClassId = bcId,
            IsActive = true
        }).ToList();

        await _unitOfWork.Routes.AddAsync(route);
        await _unitOfWork.SaveChangesAsync();

        var createdRoute = await _unitOfWork.Routes.GetByIdAsync(route.Id);
        var routeDto = _mapper.Map<RouteDto>(createdRoute);
        return Result<RouteDto>.Success(routeDto);
    }

    public async Task<Result<RouteDto>> UpdateRouteAsync(UpdateRouteDto dto)
    {
        if (!_currentUser.IsAdmin)
            throw new UnauthorizedException("Only administrators can update routes");

        if (!dto.BookingClassIds.Any())
            throw new ValidationException("At least one booking class must be selected");

        var route = await _unitOfWork.Routes.GetByIdAsync(dto.Id);
        if (route == null)
            throw new NotFoundException("Route not found");

        var newRouteCode = $"{dto.Origin.Substring(0, Math.Min(3, dto.Origin.Length)).ToUpper()}-{dto.Destination.Substring(0, Math.Min(3, dto.Destination.Length)).ToUpper()}";
        
        if (newRouteCode != route.RouteCode)
        {
            var existingRoute = await _unitOfWork.Routes.GetByCodeAsync(newRouteCode);
            if (existingRoute != null)
                throw new BusinessException($"Route code '{newRouteCode}' already exists");
        }

        _mapper.Map(dto, route);
        route.RouteCode = newRouteCode;

        route.RouteBookingClasses.Clear();
        route.RouteBookingClasses = dto.BookingClassIds.Select(bcId => new RouteBookingClass
        {
            RouteId = route.Id,
            BookingClassId = bcId,
            IsActive = true
        }).ToList();
        
        await _unitOfWork.Routes.UpdateAsync(route);
        await _unitOfWork.SaveChangesAsync();

        var updatedRoute = await _unitOfWork.Routes.GetByIdAsync(route.Id);
        var routeDto = _mapper.Map<RouteDto>(updatedRoute);
        return Result<RouteDto>.Success(routeDto);
    }

    public async Task<Result> DeleteRouteAsync(int id)
    {
        if (!_currentUser.IsAdmin)
            throw new UnauthorizedException("Only administrators can delete routes");

        var route = await _unitOfWork.Routes.GetByIdAsync(id);
        if (route == null)
            throw new NotFoundException("Route not found");

        var isUsed = await _unitOfWork.Routes.ExistsAsync(r => 
            r.TourOperatorRoutes.Any(tor => tor.RouteId == id));
        
        if (isUsed)
            throw new BusinessException("Cannot delete route that is assigned to tour operators");

        await _unitOfWork.Routes.DeleteAsync(route);
        await _unitOfWork.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<List<RouteDto>>> GetAvailableRoutesAsync()
    {
        var routes = await _unitOfWork.Routes.GetActiveRoutesAsync();
        
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId.HasValue)
        {
            var assignedRouteIds = await _unitOfWork.Routes
                .GetRoutesByTourOperatorAsync(_currentUser.TourOperatorId.Value);
            var assignedIds = assignedRouteIds.Select(r => r.Id).ToHashSet();
            
            routes = routes.Where(r => !assignedIds.Contains(r.Id));
        }

        var routeDtos = _mapper.Map<List<RouteDto>>(routes);
        return Result<List<RouteDto>>.Success(routeDtos);
    }
}
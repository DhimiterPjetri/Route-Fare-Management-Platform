using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.Common.Models;
using RouteFare.Application.DTOs.TourOperator;
using RouteFare.Application.DTOs.TourOperatorRoute;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Enums;
using RouteFare.Domain.Interfaces;
using RouteFare.Application.Common.Exceptions;

namespace RouteFare.Application.Services;

public class TourOperatorService : ITourOperatorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _context;

    public TourOperatorService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ICurrentUserService currentUser,
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _userManager = userManager;
        _context = context;
    }

    public async Task<Result<PagedResult<TourOperatorDto>>> GetTourOperatorsAsync(TourOperatorFilterDto filter)
    {
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId.HasValue)
        {
            var ownOperator = await _unitOfWork.TourOperators.GetWithDetailsAsync(_currentUser.TourOperatorId.Value);
            if (ownOperator == null)
                throw new NotFoundException("Tour operator not found");

            var dto = _mapper.Map<TourOperatorDto>(ownOperator);
            var singleResult = new PagedResult<TourOperatorDto>(new List<TourOperatorDto> { dto }, 1, 1, 1);
            return Result<PagedResult<TourOperatorDto>>.Success(singleResult);
        }

        var query = await _unitOfWork.TourOperators.GetAllAsync();

        if (filter.IsActive.HasValue)
            query = query.Where(t => t.IsActive == filter.IsActive.Value);
        
        if (!string.IsNullOrEmpty(filter.Code))
            query = query.Where(t => t.Code.Contains(filter.Code, StringComparison.OrdinalIgnoreCase));
        
        if (!string.IsNullOrEmpty(filter.SearchTerm))
            query = query.Where(t => 
                t.Name.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.Code.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                t.ContactEmail.Contains(filter.SearchTerm, StringComparison.OrdinalIgnoreCase));

        query = filter.SortBy?.ToLower() switch
        {
            "name" => filter.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "code" => filter.SortDescending ? query.OrderByDescending(t => t.Code) : query.OrderBy(t => t.Code),
            _ => filter.SortDescending ? query.OrderByDescending(t => t.Id) : query.OrderBy(t => t.Id)
        };

        var totalCount = query.Count();
        var items = query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var dtos = _mapper.Map<List<TourOperatorDto>>(items);
        var pagedResult = new PagedResult<TourOperatorDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
        
        return Result<PagedResult<TourOperatorDto>>.Success(pagedResult);
    }

    public async Task<Result<TourOperatorDto>> GetTourOperatorByIdAsync(int id)
    {
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != id)
            throw new UnauthorizedException("Unauthorized");

        var tourOperator = await _unitOfWork.TourOperators.GetWithDetailsAsync(id);
        if (tourOperator == null)
            throw new NotFoundException("Tour operator not found");

        var dto = _mapper.Map<TourOperatorDto>(tourOperator);
        return Result<TourOperatorDto>.Success(dto);
    }

    public async Task<Result<TourOperatorDto>> CreateTourOperatorAsync(CreateTourOperatorDto dto)
    {
        if (!_currentUser.IsAdmin)
            throw new UnauthorizedException("Unauthorized");

        var existing = await _unitOfWork.TourOperators.GetByCodeAsync(dto.Code);
        if (existing != null)
            throw new BusinessException("Tour operator code already exists");

        var tourOperator = _mapper.Map<TourOperator>(dto);
        await _unitOfWork.TourOperators.AddAsync(tourOperator);
        await _unitOfWork.SaveChangesAsync();

        if (dto.BookingClassIds.Any())
        {
            foreach (var classId in dto.BookingClassIds)
            {
                _context.Set<TourOperatorBookingClass>().Add(new TourOperatorBookingClass
                {
                    TourOperatorId = tourOperator.Id,
                    BookingClassId = classId,
                    IsActive = true
                });
            }
            await _context.SaveChangesAsync();
        }

        if (dto.InitialUser != null)
        {
            var user = new ApplicationUser
            {
                Email = dto.InitialUser.Email,
                UserName = dto.InitialUser.Email,
                FirstName = dto.InitialUser.FirstName,
                LastName = dto.InitialUser.LastName,
                TourOperatorId = tourOperator.Id,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.InitialUser.Password);
            if (!result.Succeeded)
            {
                await _unitOfWork.TourOperators.DeleteAsync(tourOperator);
                await _unitOfWork.SaveChangesAsync();
                throw new BusinessException("Failed to create user account");
            }

            await _userManager.AddToRoleAsync(user, UserRole.TourOperator);
        }

        var createdOperator = await _unitOfWork.TourOperators.GetWithDetailsAsync(tourOperator.Id);
        var resultDto = _mapper.Map<TourOperatorDto>(createdOperator);
        return Result<TourOperatorDto>.Success(resultDto);
    }

    public async Task<Result<TourOperatorDto>> UpdateTourOperatorAsync(UpdateTourOperatorDto dto)
    {
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != dto.Id)
            throw new UnauthorizedException("Unauthorized");

        var tourOperator = await _unitOfWork.TourOperators.GetWithDetailsAsync(dto.Id);
        if (tourOperator == null)
            throw new NotFoundException("Tour operator not found");

        _mapper.Map(dto, tourOperator);
        await _unitOfWork.TourOperators.UpdateAsync(tourOperator);

        var existingClasses = _context.Set<TourOperatorBookingClass>()
            .Where(tc => tc.TourOperatorId == dto.Id);
        
        _context.Set<TourOperatorBookingClass>().RemoveRange(existingClasses);
        
        foreach (var classId in dto.BookingClassIds)
        {
            _context.Set<TourOperatorBookingClass>().Add(new TourOperatorBookingClass
            {
                TourOperatorId = dto.Id,
                BookingClassId = classId,
                IsActive = true
            });
        }

        await _unitOfWork.SaveChangesAsync();
        await _context.SaveChangesAsync();

        var updated = await _unitOfWork.TourOperators.GetWithDetailsAsync(dto.Id);
        var resultDto = _mapper.Map<TourOperatorDto>(updated);
        return Result<TourOperatorDto>.Success(resultDto);
    }

    public async Task<Result<List<TourOperatorRouteDto>>> AssignRoutesToSeasonAsync(AssignRoutesToSeasonDto dto)
    {
        var tourOperatorId = dto.TourOperatorId ?? _currentUser.TourOperatorId;
        
        if (!tourOperatorId.HasValue)
            throw new BusinessException("Tour operator not specified");

        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorId)
            throw new UnauthorizedException("Unauthorized");

        var season = await _unitOfWork.Seasons.GetByIdAsync(dto.SeasonId);
        if (season == null || !season.IsActive)
            throw new BusinessException("Invalid or inactive season");

        var existingAssignments = await _context.Set<TourOperatorRoute>()
            .Where(tr => tr.TourOperatorId == tourOperatorId.Value && tr.SeasonId == dto.SeasonId)
            .ToListAsync();
        
        _context.Set<TourOperatorRoute>().RemoveRange(existingAssignments);

        var newAssignments = new List<TourOperatorRoute>();
        
        foreach (var routeId in dto.RouteIds)
        {
            var route = await _unitOfWork.Routes.GetByIdAsync(routeId);
            if (route == null || !route.IsActive)
                continue;

            var assignment = new TourOperatorRoute
            {
                TourOperatorId = tourOperatorId.Value,
                RouteId = routeId,
                SeasonId = dto.SeasonId,
                IsActive = true
            };
            
            newAssignments.Add(assignment);
            _context.Set<TourOperatorRoute>().Add(assignment);
        }

        await _context.SaveChangesAsync();

        await GeneratePricingRecordsAsync(newAssignments, season);

        var assignmentDtos = _mapper.Map<List<TourOperatorRouteDto>>(newAssignments);
        return Result<List<TourOperatorRouteDto>>.Success(assignmentDtos);
    }

    private async Task GeneratePricingRecordsAsync(List<TourOperatorRoute> assignments, Season season)
    {
        foreach (var assignment in assignments)
        {
            var bookingClasses = await _context.Set<TourOperatorBookingClass>()
                .Where(tc => tc.TourOperatorId == assignment.TourOperatorId && tc.IsActive)
                .Select(tc => tc.BookingClassId)
                .ToListAsync();

            var currentDate = season.StartDate;
            while (currentDate <= season.EndDate)
            {
                foreach (var classId in bookingClasses)
                {
                    var pricing = new Pricing
                    {
                        TourOperatorId = assignment.TourOperatorId,
                        RouteId = assignment.RouteId,
                        SeasonId = assignment.SeasonId,
                        BookingClassId = classId,
                        Date = currentDate,
                        DayOfWeek = currentDate.DayOfWeek,
                        Price = 0, 
                        RequestedSeats = 0, 
                        TourOperatorRouteId = assignment.Id
                    };
                    
                    await _unitOfWork.Pricings.AddAsync(pricing);
                }
                
                currentDate = currentDate.AddDays(1);
            }
        }
        
        await _unitOfWork.SaveChangesAsync();
    }
}
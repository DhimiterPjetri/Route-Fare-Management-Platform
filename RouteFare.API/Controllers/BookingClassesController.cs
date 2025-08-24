using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.BookingClass;
using RouteFare.Domain.Entities;
using AutoMapper;
using RouteFare.Application.Common.Exceptions;

namespace RouteFare.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingClassesController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public BookingClassesController(
        IApplicationDbContext context,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _context = context;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookingClasses()
    {
        var bookingClasses = await _context.BookingClasses
            .Where(bc => bc.IsActive)
            .OrderBy(bc => bc.DisplayOrder)
            .ToListAsync();

        var dtos = _mapper.Map<List<BookingClassDto>>(bookingClasses);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookingClass(int id)
    {
        var bookingClass = await _context.BookingClasses.FindAsync(id);

        if (bookingClass == null)
            throw new NotFoundException("Booking class not found");

        var dto = _mapper.Map<BookingClassDto>(bookingClass);
        return Ok(dto);
    }

    [HttpGet("tour-operator/{tourOperatorId}")]
    public async Task<IActionResult> GetTourOperatorBookingClasses(int tourOperatorId)
    {
        if (!_currentUser.IsAdmin && _currentUser.TourOperatorId != tourOperatorId)
            throw new ForbiddenException("You can only view your own booking classes");

        var bookingClasses = await _context.Set<TourOperatorBookingClass>()
            .Include(tb => tb.BookingClass)
            .Where(tb => tb.TourOperatorId == tourOperatorId && tb.IsActive)
            .Select(tb => tb.BookingClass)
            .OrderBy(bc => bc.DisplayOrder)
            .ToListAsync();

        var dtos = _mapper.Map<List<BookingClassDto>>(bookingClasses);
        return Ok(dtos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBookingClass([FromBody] CreateBookingClassDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingClass = await _context.BookingClasses
            .FirstOrDefaultAsync(bc => bc.Code == dto.Code);

        if (existingClass != null)
            throw new BusinessException("Booking class with this code already exists");

        var bookingClass = new BookingClass
        {
            Name = dto.Name,
            Code = dto.Code,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive
        };

        _context.BookingClasses.Add(bookingClass);
        await _context.SaveChangesAsync();

        var resultDto = _mapper.Map<BookingClassDto>(bookingClass);
        return CreatedAtAction(nameof(GetBookingClass), new { id = bookingClass.Id }, resultDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBookingClass(int id, [FromBody] UpdateBookingClassDto dto)
    {
        if (id != dto.Id)
            return BadRequest("Booking class ID mismatch");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var bookingClass = await _context.BookingClasses.FindAsync(id);
        if (bookingClass == null)
            throw new NotFoundException("Booking class not found");

        bookingClass.Name = dto.Name;
        bookingClass.DisplayOrder = dto.DisplayOrder;
        bookingClass.IsActive = dto.IsActive;

        _context.BookingClasses.Update(bookingClass);
        await _context.SaveChangesAsync();

        var resultDto = _mapper.Map<BookingClassDto>(bookingClass);
        return Ok(resultDto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBookingClass(int id)
    {
        var bookingClass = await _context.BookingClasses.FindAsync(id);
        if (bookingClass == null)
            throw new NotFoundException("Booking class not found");

        var isUsed = await _context.Set<TourOperatorBookingClass>()
            .AnyAsync(tb => tb.BookingClassId == id);

        if (isUsed)
            throw new BusinessException("Cannot delete booking class that is assigned to tour operators");

        _context.BookingClasses.Remove(bookingClass);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
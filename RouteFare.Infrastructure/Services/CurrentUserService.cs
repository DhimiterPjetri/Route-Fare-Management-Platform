using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Domain.Enums;

namespace RouteFare.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    
    public string? UserEmail => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
    
    public string? UserRole => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
    
    public int? TourOperatorId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirstValue("TourOperatorId");
            return string.IsNullOrEmpty(value) ? null : int.Parse(value);
        }
    }
    
    public bool IsAdmin => UserRole == Domain.Enums.UserRole.Admin;
}
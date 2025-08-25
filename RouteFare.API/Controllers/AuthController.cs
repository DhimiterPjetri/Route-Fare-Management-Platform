using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.Auth;

namespace RouteFare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Authenticates user and returns JWT token
    /// </summary>
    /// <param name="loginDto">User login credentials</param>
    [HttpPost("login")]
    [ProducesResponseType(typeof(TokenResponseDto), 200)]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        return Ok(result);
    }

    /// <summary>
    /// Register new user account
    /// </summary>
    /// <param name="registerDto">User registration information</param>
    [HttpPost("register")]
    [ProducesResponseType(typeof(TokenResponseDto), 200)]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        return Ok(result);
    }

    /// <summary>
    /// Refresh JWT token using refresh token
    /// </summary>
    /// <param name="refreshTokenDto">Refresh token credentials</param>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenResponseDto), 200)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        var result = await _authService.RefreshTokenAsync(refreshTokenDto);
        return Ok(result);
    }

    /// <summary>
    /// Revoke user's refresh token (logout)
    /// </summary>
    [Authorize]
    [HttpPost("revoke")]
    [ProducesResponseType(typeof(object), 200)]
    public async Task<IActionResult> RevokeToken()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return BadRequest(new { message = "User ID not found in token" });

        await _authService.RevokeTokenAsync(userId);
        return Ok(new { message = "Token revoked successfully" });
    }
}
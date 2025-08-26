using Microsoft.AspNetCore.Mvc;

namespace RouteFare.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            status = "healthy", 
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            message = "RouteFare API is running successfully"
        });
    }
}
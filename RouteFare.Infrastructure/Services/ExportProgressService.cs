using Microsoft.AspNetCore.SignalR;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.DTOs.Export;
using RouteFare.Infrastructure.SignalR;

namespace RouteFare.Infrastructure.Services;

public class ExportProgressService : RouteFare.Application.Common.Interfaces.IExportProgressHub
{
    private readonly IHubContext<ExportProgressHub> _hubContext;

    public ExportProgressService(IHubContext<ExportProgressHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendProgress(string userId, int progress, string message)
    {
        await _hubContext.Clients.User(userId).SendAsync("ExportProgress", new ExportProgressDto
        {
            JobId = Guid.NewGuid().ToString(),
            Progress = progress,
            Message = message,
            IsComplete = progress >= 100,
            HasError = false,
            Timestamp = DateTime.UtcNow
        });
    }
}
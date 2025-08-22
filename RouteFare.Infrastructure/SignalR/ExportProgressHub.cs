using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace RouteFare.Infrastructure.SignalR;

[Authorize]
public class ExportProgressHub : Hub
{
    private static readonly Dictionary<string, string> UserConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        UserConnections[userId] = Context.ConnectionId;
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        UserConnections.Remove(userId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendProgress(string userId, int progress, string message)
    {
        if (UserConnections.TryGetValue(userId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("ExportProgress", new
            {
                Progress = progress,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
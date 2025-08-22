namespace RouteFare.Application.Common.Interfaces;

public interface IExportProgressHub
{
    Task SendProgress(string userId, int progress, string message);
}
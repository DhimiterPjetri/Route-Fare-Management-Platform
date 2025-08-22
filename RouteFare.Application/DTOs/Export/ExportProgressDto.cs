namespace RouteFare.Application.DTOs.Export;

public class ExportProgressDto
{
    public string JobId { get; set; } = string.Empty;
    public int Progress { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? DownloadUrl { get; set; }
    public bool IsComplete { get; set; }
    public bool HasError { get; set; }
    public DateTime Timestamp { get; set; }
}
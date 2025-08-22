namespace RouteFare.Application.DTOs.Export;

public class ExportRequestDto
{
    public ExportType Type { get; set; }
    public int? TourOperatorId { get; set; }
    public int? SeasonId { get; set; }
    public int? RouteId { get; set; }
    public bool IncludeSummary { get; set; } = true;
    public bool IncludeDetails { get; set; } = true;
}

public enum ExportType
{
    AllData,
    SeasonData,
    RouteData,
    TourOperatorData
}
namespace RouteFare.Application.DTOs.Season;

public class SeasonDto
{
    public int Id { get; set; }
    public int Year { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int TotalDays => (EndDate - StartDate).Days + 1;
}
namespace RouteFare.Application.DTOs.TourOperator;

public class UpdateTourOperatorDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<int> BookingClassIds { get; set; } = new();
}
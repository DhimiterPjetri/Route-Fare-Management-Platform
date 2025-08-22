namespace RouteFare.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserEmail { get; }
    string? UserRole { get; }
    int? TourOperatorId { get; }
    bool IsAdmin { get; }
}
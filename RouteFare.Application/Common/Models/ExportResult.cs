namespace RouteFare.Application.Common.Models;

public class ExportResult<T> : Result<T>
{
    public string? JobId { get; private set; }

    protected ExportResult(bool succeeded, T? data, string? jobId, string? error = null, List<string>? errors = null) 
        : base(succeeded, data, error, errors)
    {
        JobId = jobId;
    }

    public static ExportResult<T> Success(T data, string? jobId = null)
    {
        return new ExportResult<T>(true, data, jobId);
    }

    public static new ExportResult<T> Failure(string error)
    {
        return new ExportResult<T>(false, default, null, error);
    }

    public static new ExportResult<T> Failure(List<string> errors)
    {
        return new ExportResult<T>(false, default, null, errors: errors);
    }
}
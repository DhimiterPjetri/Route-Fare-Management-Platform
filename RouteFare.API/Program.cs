using RouteFare.Application;
using RouteFare.Infrastructure;
using Scalar.AspNetCore;
using System.Reflection;

// Set EPPlus license for non-commercial personal use
Environment.SetEnvironmentVariable("EPPlusLicense", "NonCommercialPersonal:RouteFare Development");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add controllers and API services
builder.Services.AddControllers();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        // Set API metadata
        document.Info.Title = "Route Fare Management API";
        document.Info.Description = "API for managing seasonal routes and fares for multiple tour operators";
        document.Info.Version = "v1";
        
        document.Components ??= new();
        document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSecurityScheme>();
        document.Components.SecuritySchemes.Add("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        });

        // Add security requirement to all operations
        document.SecurityRequirements = new List<Microsoft.OpenApi.Models.OpenApiSecurityRequirement>
        {
            new()
            {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            }
        };

        return Task.CompletedTask;
    });

    // Include XML comments for better documentation
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    
    options.AddPolicy("SignalRPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:3000", "https://localhost:3000", "http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("RouteFare Management API")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseMiddleware<RouteFare.API.Middleware.ErrorHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<RouteFare.Infrastructure.SignalR.ExportProgressHub>("/exportProgressHub").RequireCors("SignalRPolicy");

app.Run();

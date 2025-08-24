using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using FluentValidation;
using RouteFare.Application.Common.Interfaces;
using RouteFare.Application.Services;

namespace RouteFare.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Add AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // Add FluentValidation
        //services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        // Register application services
        services.AddScoped<IRouteService, RouteService>();
        services.AddScoped<ISeasonService, SeasonService>();
        services.AddScoped<ITourOperatorService, TourOperatorService>();
        services.AddScoped<IPricingService, PricingService>();
        services.AddScoped<IExcelExportService, ExcelExportService>();

        return services;
    }
}
# Use the official .NET 9 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["RouteFare.API/RouteFare.API.csproj", "RouteFare.API/"]
COPY ["RouteFare.Application/RouteFare.Application.csproj", "RouteFare.Application/"]
COPY ["RouteFare.Infrastructure/RouteFare.Infrastructure.csproj", "RouteFare.Infrastructure/"]
COPY ["RouteFare.Domain/RouteFare.Domain.csproj", "RouteFare.Domain/"]

RUN dotnet restore "RouteFare.API/RouteFare.API.csproj"

# Copy all source files
COPY . .

# Build the application
WORKDIR "/src/RouteFare.API"
RUN dotnet build "RouteFare.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "RouteFare.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 9 runtime image for running
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV EPPlusLicense="NonCommercialPersonal:RouteFare Development"

# Install necessary tools for debugging (optional)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dotnet", "RouteFare.API.dll"]
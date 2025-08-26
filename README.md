# RouteFareManagement Platform

A full-stack Route Fare Management Platform built with Angular 20.2.1 frontend and .NET 9 Web API backend. The system manages seasonal routes and fares for multiple tour operators with role-based access control, real-time Excel export functionality, and Docker containerization for easy deployment.

## Architecture Overview

### Hybrid Containerized Architecture
- **Backend + Database**: Fully containerized with Docker (SQL Server + .NET API)
- **Frontend**: Local development server for optimal development experience
- **Communication**: Cross-origin requests with CORS configuration

### Technology Stack

#### Backend (.NET 9) - Containerized
- **ASP.NET Core Web API 9.0** 
- **Entity Framework Core 9.0.8** 
- **ASP.NET Core Identity**
- **JWT Bearer Authentication**
- **SignalR**
- **AutoMapper 12.0.1**
- **EPPlus 8.1.0**
- **Scalar.AspNetCore 2.6.9**

#### Frontend (Angular 20.2.1) - Local Development
- **Angular CLI 20.2.0**
- **Angular Material 20.2.0**
- **TypeScript 5.9.2**
- **RxJS 7.8.2**
- **SignalR Client**

#### Database - Containerized
- **SQL Server 2022**
- **Automatic Migrations**
- **Persistent Storage**

## Quick Start Guide

### Prerequisites
- **Docker Desktop** - Required for backend services
- **Node.js 18+** - Required for Angular frontend
- **Angular CLI** - Install with `npm install -g @angular/cli`

### 1. Start Backend Services (Containerized)
```bash
# Start SQL Server + API containers
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Expected Output:**
- `routefare-sqlserver`: Healthy on port 1433
- `routefare-api`: Healthy on port 8080

### 2. Start Frontend (Local Development)
```bash
# Navigate to frontend directory
cd RouteFare.Frontend

# Install dependencies
npm install

# Start development server
ng serve
```

### 3. Access Application
- **Frontend**: http://localhost:4200
- **API Documentation**: http://localhost:8080/scalar/v1
- **API Health Check**: http://localhost:8080/api/health

### 4. Test Login
Use these default test accounts:

**Admin User:**
- Email: `admin@test.com`
- Password: `Admin123!`

**Tour Operator User:**
- Email: `operator@test.com`
- Password: `Operator123!`

## Development Workflow

```bash
# Start backend
docker-compose up -d

# Start frontend development
cd RouteFare.Frontend
ng serve

# Your app is now running at http://localhost:4200
```
### Access Database
Connect to the containerized SQL Server using:
- **Server**: `localhost,1433`
- **Authentication**: SQL Server Authentication
- **Username**: `sa`
- **Password**: `RouteFare123!`
- **Database**: `RouteFareDB`

### Database Management
```bash
# View logs
docker-compose logs routefare-api
docker-compose logs routefare-sqlserver

# Rebuild API after code changes
docker-compose up --build -d routefare-api
```


## Clean Architecture Structure

```
├── RouteFare.Domain/          # Core business entities and interfaces
├── RouteFare.Application/     # Application services, DTOs, business logic
├── RouteFare.Infrastructure/  # Data access, repositories, external services
├── RouteFare.API/             # Web API controllers, middleware, configuration
├── RouteFare.Frontend/        # Angular application
├── docker-compose.yml         # Container orchestration
├── Dockerfile                 # API container definition
└── DOCKER-SETUP.md            # Detailed Docker documentation
```

## Key Features

### Authentication & Authorization
- **JWT Token-based Authentication** with refresh token support
- **Role-based Authorization**: Admin and TourOperator roles
- **Protected Routes** with Angular guards
- **HTTP Interceptors** for automatic token attachment

### Real-time Communication
- **SignalR Integration** for export progress tracking
- **WebSocket Connections** with automatic reconnection
- **Progress Observables** using RxJS for reactive UI updates

### Error Handling
- **Centralized Backend Middleware** with custom exceptions
- **Frontend Error Interceptor** with user-friendly messages
- **Consistent Error UX** via Angular Material notifications

### Excel Export System
- **EPPlus Library** for Excel file generation
- **Multiple Sheet Support** (Summary and Detailed views)
- **Real-time Progress Tracking** via SignalR
- **Large Dataset Handling** with memory-efficient processing

## Database Schema

The system automatically creates tables for:
- **Users & Authentication** (ASP.NET Identity tables)
- **Routes** - Travel routes with origin/destination
- **Seasons** - Time periods for pricing (Winter/Summer)
- **Tour Operators** - Companies managing routes
- **Booking Classes** - Service levels (Economy, Business, etc.)
- **Pricing** - Route-specific pricing per season and class

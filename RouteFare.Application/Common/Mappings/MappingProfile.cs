using AutoMapper;
using RouteFare.Application.DTOs.Auth;
using RouteFare.Application.DTOs.BookingClass;
using RouteFare.Application.DTOs.Pricing;
using RouteFare.Application.DTOs.Route;
using RouteFare.Application.DTOs.Season;
using RouteFare.Application.DTOs.TourOperator;
using RouteFare.Application.DTOs.TourOperatorRoute;
using RouteFare.Domain.Entities;
using RouteFare.Domain.Enums;

namespace RouteFare.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<ApplicationUser, UserDto>()
            .ForMember(d => d.Role, opt => opt.Ignore()); 

        CreateMap<Route, RouteDto>();
        CreateMap<CreateRouteDto, Route>()
            .ForMember(d => d.RouteCode, opt => opt.MapFrom(s => 
                string.IsNullOrEmpty(s.RouteCode) 
                    ? $"{s.Origin.Substring(0, 3).ToUpper()}-{s.Destination.Substring(0, 3).ToUpper()}" 
                    : s.RouteCode));
        CreateMap<UpdateRouteDto, Route>();

        CreateMap<Season, SeasonDto>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()));

        CreateMap<TourOperator, TourOperatorDto>()
            .ForMember(d => d.UserCount, opt => opt.MapFrom(s => s.Users.Count))
            .ForMember(d => d.BookingClasses, opt => opt.MapFrom(s => 
                s.BookingClasses.Select(bc => bc.BookingClass)));
        CreateMap<CreateTourOperatorDto, TourOperator>();
        CreateMap<UpdateTourOperatorDto, TourOperator>();

        CreateMap<BookingClass, BookingClassDto>();

        CreateMap<TourOperatorRoute, TourOperatorRouteDto>()
            .ForMember(d => d.TourOperatorName, opt => opt.MapFrom(s => s.TourOperator.Name))
            .ForMember(d => d.RouteCode, opt => opt.MapFrom(s => s.Route.RouteCode))
            .ForMember(d => d.Origin, opt => opt.MapFrom(s => s.Route.Origin))
            .ForMember(d => d.Destination, opt => opt.MapFrom(s => s.Route.Destination))
            .ForMember(d => d.SeasonName, opt => opt.MapFrom(s => s.Season.Name));

        CreateMap<Pricing, PricingDto>()
            .ForMember(d => d.TourOperatorName, opt => opt.MapFrom(s => s.TourOperator.Name))
            .ForMember(d => d.RouteCode, opt => opt.MapFrom(s => s.Route.RouteCode))
            .ForMember(d => d.SeasonName, opt => opt.MapFrom(s => s.Season.Name))
            .ForMember(d => d.BookingClassName, opt => opt.MapFrom(s => s.BookingClass.Name))
            .ForMember(d => d.DayOfWeek, opt => opt.MapFrom(s => s.DayOfWeek.ToString()));
    }
}
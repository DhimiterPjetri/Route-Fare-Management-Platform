import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TourOperatorRouteDto, AssignRoutesToSeasonDto } from '../models/tour-operator/tour-operator-route.model';

@Injectable({
  providedIn: 'root'
})
export class TourOperatorRouteService {

  constructor(private apiService: ApiService) {}

  getTourOperatorRoutes(tourOperatorId?: number, seasonId?: number): Observable<TourOperatorRouteDto[]> {
    const params: any = {};
    if (tourOperatorId) params.tourOperatorId = tourOperatorId;
    if (seasonId) params.seasonId = seasonId;
    
    return this.apiService.get<TourOperatorRouteDto[]>('TourOperatorRoutes', params);
  }

  assignRoutesToSeason(assignment: AssignRoutesToSeasonDto): Observable<void> {
    return this.apiService.post<void>('TourOperatorRoutes/assign', assignment);
  }

  removeRouteFromSeason(tourOperatorId: number, routeId: number, seasonId: number): Observable<void> {
    return this.apiService.delete<void>(`TourOperatorRoutes/${tourOperatorId}/${routeId}/${seasonId}`);
  }

  getAssignedRoutes(tourOperatorId: number, seasonId: number): Observable<TourOperatorRouteDto[]> {
    return this.apiService.get<TourOperatorRouteDto[]>(`TourOperatorRoutes/assigned`, {
      tourOperatorId,
      seasonId
    });
  }

  getByRouteId(routeId: number): Observable<TourOperatorRouteDto[]> {
    return this.apiService.get<TourOperatorRouteDto[]>('TourOperatorRoutes', {
      routeId
    });
  }

  getBySeasonId(seasonId: number): Observable<TourOperatorRouteDto[]> {
    return this.apiService.get<TourOperatorRouteDto[]>('TourOperatorRoutes', {
      seasonId
    });
  }

  getTourOperatorRouteById(id: number): Observable<TourOperatorRouteDto> {
    return this.apiService.get<TourOperatorRouteDto>(`TourOperatorRoutes/${id}`);
  }
}
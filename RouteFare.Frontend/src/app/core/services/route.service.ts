import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RouteDto, CreateRouteDto, UpdateRouteDto, RouteFilterDto } from '../models/route/route.model';
import { PagedResult } from '../models/common/api.model';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private apiService: ApiService) {}

  getRoutes(filter?: RouteFilterDto): Observable<PagedResult<RouteDto>> {
    return this.apiService.get<PagedResult<RouteDto>>('Routes', filter);
  }

  getRoute(id: number): Observable<RouteDto> {
    return this.apiService.get<RouteDto>(`Routes/${id}`);
  }

  createRoute(route: CreateRouteDto): Observable<RouteDto> {
    return this.apiService.post<RouteDto>('Routes', route);
  }

  updateRoute(route: UpdateRouteDto): Observable<RouteDto> {
    return this.apiService.put<RouteDto>(`Routes/${route.id}`, route);
  }

  deleteRoute(id: number): Observable<void> {
    return this.apiService.delete<void>(`Routes/${id}`);
  }

  getAvailableRoutes(): Observable<RouteDto[]> {
    return this.apiService.get<RouteDto[]>('Routes/available');
  }
}
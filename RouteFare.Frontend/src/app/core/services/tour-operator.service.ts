import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  TourOperatorDto, 
  CreateTourOperatorDto, 
  UpdateTourOperatorDto, 
  TourOperatorFilterDto,
  CreateOperatorUserDto 
} from '../models/tour-operator/tour-operator.model';
import { AssignRoutesToSeasonDto } from '../models/tour-operator/tour-operator-route.model';
import { PagedResult } from '../models/common/api.model';

@Injectable({
  providedIn: 'root'
})
export class TourOperatorService {

  constructor(private apiService: ApiService) {}

  getTourOperators(filter?: TourOperatorFilterDto): Observable<PagedResult<TourOperatorDto>> {
    return this.apiService.get<PagedResult<TourOperatorDto>>('TourOperators', filter);
  }

  getTourOperator(id: number): Observable<TourOperatorDto> {
    return this.apiService.get<TourOperatorDto>(`TourOperators/${id}`);
  }

  createTourOperator(tourOperator: CreateTourOperatorDto): Observable<TourOperatorDto> {
    return this.apiService.post<TourOperatorDto>('TourOperators', tourOperator);
  }

  updateTourOperator(tourOperator: UpdateTourOperatorDto): Observable<TourOperatorDto> {
    return this.apiService.put<TourOperatorDto>(`TourOperators/${tourOperator.id}`, tourOperator);
  }

  deleteTourOperator(id: number): Observable<void> {
    return this.apiService.delete<void>(`TourOperators/${id}`);
  }

  createOperatorUser(userData: CreateOperatorUserDto): Observable<void> {
    return this.apiService.post<void>('TourOperators/create-user', userData);
  }

  assignRoutesToSeason(assignment: AssignRoutesToSeasonDto): Observable<void> {
    return this.apiService.post<void>('TourOperators/assign-routes', assignment);
  }
}
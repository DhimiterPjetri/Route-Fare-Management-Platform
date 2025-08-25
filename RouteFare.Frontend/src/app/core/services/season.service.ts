import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SeasonDto, CreateSeasonDto, UpdateSeasonDto, SeasonFilterDto } from '../models/season/season.model';
import { PagedResult } from '../models/common/api.model';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {

  constructor(private apiService: ApiService) {}

  getSeasons(filter?: SeasonFilterDto): Observable<PagedResult<SeasonDto>> {
    return this.apiService.get<PagedResult<SeasonDto>>('Seasons', filter);
  }

  getSeason(id: number): Observable<SeasonDto> {
    return this.apiService.get<SeasonDto>(`Seasons/${id}`);
  }

  createSeason(season: CreateSeasonDto): Observable<SeasonDto> {
    return this.apiService.post<SeasonDto>('Seasons', season);
  }

  updateSeason(season: UpdateSeasonDto): Observable<SeasonDto> {
    return this.apiService.put<SeasonDto>(`Seasons/${season.id}`, season);
  }

  deleteSeason(id: number): Observable<void> {
    return this.apiService.delete<void>(`Seasons/${id}`);
  }

  getCurrentSeason(): Observable<SeasonDto> {
    return this.apiService.get<SeasonDto>('Seasons/current');
  }

  getAllSeasons(): Observable<SeasonDto[]> {
    return this.apiService.get<SeasonDto[]>('Seasons/all');
  }

  getActiveSeasons(): Observable<SeasonDto[]> {
    return this.apiService.get<SeasonDto[]>('Seasons/active');
  }
}
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { SeasonDto, SeasonType } from '../../models/season/season.model';

export interface SeasonsState extends EntityState<SeasonDto> {
  isLoading: boolean;
  error: string | null;
  selectedSeasonId: number | null;
  searchTerm: string;
  seasonTypeFilter: SeasonType | null;
  isActiveFilter: boolean | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export const seasonsAdapter: EntityAdapter<SeasonDto> = createEntityAdapter<SeasonDto>({
  selectId: (season: SeasonDto) => season.id,
  sortComparer: (a: SeasonDto, b: SeasonDto) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
});

export const initialSeasonsState: SeasonsState = seasonsAdapter.getInitialState({
  isLoading: false,
  error: null,
  selectedSeasonId: null,
  searchTerm: '',
  seasonTypeFilter: null,
  isActiveFilter: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10
  }
});
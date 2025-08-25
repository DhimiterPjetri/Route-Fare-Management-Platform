import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { TourOperatorDto } from '../../models/tour-operator/tour-operator.model';

export interface TourOperatorsState extends EntityState<TourOperatorDto> {
  isLoading: boolean;
  error: string | null;
  selectedTourOperatorId: number | null;
  searchTerm: string;
  isActiveFilter: boolean | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export const tourOperatorsAdapter: EntityAdapter<TourOperatorDto> = createEntityAdapter<TourOperatorDto>({
  selectId: (operator: TourOperatorDto) => operator.id,
  sortComparer: (a: TourOperatorDto, b: TourOperatorDto) => a.name.localeCompare(b.name)
});

export const initialTourOperatorsState: TourOperatorsState = tourOperatorsAdapter.getInitialState({
  isLoading: false,
  error: null,
  selectedTourOperatorId: null,
  searchTerm: '',
  isActiveFilter: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10
  }
});
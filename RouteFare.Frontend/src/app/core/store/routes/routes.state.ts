import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { RouteDto } from '../../models/route/route.model';
import { PagedResult } from '../../models/common/api.model';

export interface RoutesState extends EntityState<RouteDto> {
  isLoading: boolean;
  error: string | null;
  selectedRouteId: number | null;
  searchTerm: string;
  isActiveFilter: boolean | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export const routesAdapter: EntityAdapter<RouteDto> = createEntityAdapter<RouteDto>({
  selectId: (route: RouteDto) => route.id,
  sortComparer: (a: RouteDto, b: RouteDto) => a.routeCode.localeCompare(b.routeCode)
});

export const initialRoutesState: RoutesState = routesAdapter.getInitialState({
  isLoading: false,
  error: null,
  selectedRouteId: null,
  searchTerm: '',
  isActiveFilter: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10
  }
});
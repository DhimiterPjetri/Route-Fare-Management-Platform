import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { PricingDto } from '../../models/pricing/pricing.model';

export interface PricingState extends EntityState<PricingDto> {
  isLoading: boolean;
  error: string | null;
  selectedPricingId: number | null;
  filters: {
    tourOperatorId: number | null;
    routeId: number | null;
    seasonId: number | null;
    bookingClassId: number | null;
    startDate: Date | null;
    endDate: Date | null;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
  bulkUpdateMode: boolean;
  selectedPricingIds: number[];
}

export const pricingAdapter: EntityAdapter<PricingDto> = createEntityAdapter<PricingDto>({
  selectId: (pricing: PricingDto) => pricing.id,
  sortComparer: (a: PricingDto, b: PricingDto) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateComparison !== 0 ? dateComparison : a.routeCode.localeCompare(b.routeCode);
  }
});

export const initialPricingState: PricingState = pricingAdapter.getInitialState({
  isLoading: false,
  error: null,
  selectedPricingId: null,
  filters: {
    tourOperatorId: null,
    routeId: null,
    seasonId: null,
    bookingClassId: null,
    startDate: null,
    endDate: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 20
  },
  bulkUpdateMode: false,
  selectedPricingIds: []
});
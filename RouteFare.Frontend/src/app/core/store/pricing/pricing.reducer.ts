import { createReducer } from '@ngrx/store';
import { initialPricingState } from './pricing.state';

export const pricingReducer = createReducer(
  initialPricingState
);
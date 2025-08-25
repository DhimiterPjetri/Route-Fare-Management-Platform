import { createReducer } from '@ngrx/store';
import { initialSeasonsState } from './seasons.state';

export const seasonsReducer = createReducer(
  initialSeasonsState
);
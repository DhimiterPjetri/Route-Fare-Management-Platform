import { createReducer } from '@ngrx/store';
import { initialTourOperatorsState } from './tour-operators.state';

export const tourOperatorsReducer = createReducer(
  initialTourOperatorsState
);
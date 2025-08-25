import { createReducer } from '@ngrx/store';
import { initialRoutesState } from './routes.state';

export const routesReducer = createReducer(
  initialRoutesState
);
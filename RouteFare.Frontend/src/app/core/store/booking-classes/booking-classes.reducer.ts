import { createReducer } from '@ngrx/store';
import { initialBookingClassesState } from './booking-classes.state';

export const bookingClassesReducer = createReducer(
  initialBookingClassesState
);
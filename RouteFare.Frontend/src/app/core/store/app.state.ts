import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';

import { AuthState } from './auth/auth.state';
import { ExportState } from './export/export.state';
import { RoutesState } from './routes/routes.state';
import { SeasonsState } from './seasons/seasons.state';
import { TourOperatorsState } from './tour-operators/tour-operators.state';
import { BookingClassesState } from './booking-classes/booking-classes.state';
import { PricingState } from './pricing/pricing.state';

// Import all reducers
import { authReducer } from './auth/auth.reducer';
import { exportReducer } from './export/export.reducer';
import { routesReducer } from './routes/routes.reducer';
import { seasonsReducer } from './seasons/seasons.reducer';
import { tourOperatorsReducer } from './tour-operators/tour-operators.reducer';
import { bookingClassesReducer } from './booking-classes/booking-classes.reducer';
import { pricingReducer } from './pricing/pricing.reducer';

export interface AppState {
  auth: AuthState;
  export: ExportState;
  routes: RoutesState;
  seasons: SeasonsState;
  tourOperators: TourOperatorsState;
  bookingClasses: BookingClassesState;
  pricing: PricingState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  export: exportReducer,
  routes: routesReducer,
  seasons: seasonsReducer,
  tourOperators: tourOperatorsReducer,
  bookingClasses: bookingClassesReducer,
  pricing: pricingReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

export const selectAuthState = (state: AppState) => state.auth;
export const selectExportState = (state: AppState) => state.export;
export const selectRoutesState = (state: AppState) => state.routes;
export const selectSeasonsState = (state: AppState) => state.seasons;
export const selectTourOperatorsState = (state: AppState) => state.tourOperators;
export const selectBookingClassesState = (state: AppState) => state.bookingClasses;
export const selectPricingState = (state: AppState) => state.pricing;
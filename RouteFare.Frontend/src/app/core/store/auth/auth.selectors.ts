import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { AuthState } from './auth.state';

export const selectAuthState = (state: AppState) => state.auth;

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

export const selectIsAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectIsAdmin = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'Admin'
);

export const selectIsTourOperator = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'TourOperator'
);

export const selectUserDisplayName = createSelector(
  selectCurrentUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : ''
);

export const selectUserRoleDisplay = createSelector(
  selectCurrentUser,
  (user) => {
    if (!user) return '';
    return user.role === 'Admin' ? 'Administrator' : 'Tour Operator';
  }
);
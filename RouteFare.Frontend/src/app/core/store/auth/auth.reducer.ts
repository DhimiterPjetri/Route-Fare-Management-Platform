import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state): AuthState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { response }): AuthState => ({
    ...state,
    currentUser: response.user,
    token: response.accessToken,
    refreshToken: response.refreshToken,
    isLoading: false,
    isAuthenticated: true,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    error
  })),

  on(AuthActions.register, (state): AuthState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { response }): AuthState => ({
    ...state,
    currentUser: response.user,
    token: response.accessToken,
    refreshToken: response.refreshToken,
    isLoading: false,
    isAuthenticated: true,
    error: null
  })),

  on(AuthActions.registerFailure, (state, { error }): AuthState => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    error
  })),

  on(AuthActions.refreshToken, (state): AuthState => ({
    ...state,
    isLoading: true
  })),

  on(AuthActions.refreshTokenSuccess, (state, { response }): AuthState => ({
    ...state,
    currentUser: response.user,
    token: response.accessToken,
    refreshToken: response.refreshToken,
    isLoading: false,
    isAuthenticated: true,
    error: null
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }): AuthState => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    currentUser: null,
    error
  })),

  on(AuthActions.logout, (state): AuthState => ({
    ...state,
    currentUser: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  })),

  on(AuthActions.loadStoredAuth, (state): AuthState => ({
    ...state,
    isLoading: true
  })),

  on(AuthActions.loadStoredAuthSuccess, (state, { user, token, refreshToken }): AuthState => ({
    ...state,
    currentUser: user,
    token,
    refreshToken,
    isAuthenticated: true,
    isLoading: false,
    error: null
  })),

  on(AuthActions.loadStoredAuthFailure, (state): AuthState => ({
    ...state,
    isLoading: false,
    isAuthenticated: false
  })),

  on(AuthActions.clearAuthError, (state): AuthState => ({
    ...state,
    error: null
  }))
);
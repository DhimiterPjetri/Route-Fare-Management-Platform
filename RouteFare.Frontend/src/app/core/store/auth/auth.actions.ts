import { createAction, props } from '@ngrx/store';
import { LoginDto, RegisterDto, UserDto, TokenResponseDto } from '../../models/auth/auth.model';

export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginDto }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: TokenResponseDto }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{ userData: RegisterDto }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: TokenResponseDto }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const refreshToken = createAction(
  '[Auth] Refresh Token'
);

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ response: TokenResponseDto }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

export const logout = createAction(
  '[Auth] Logout'
);

export const loadStoredAuth = createAction(
  '[Auth] Load Stored Auth'
);

export const loadStoredAuthSuccess = createAction(
  '[Auth] Load Stored Auth Success',
  props<{ user: UserDto; token: string; refreshToken: string }>()
);

export const loadStoredAuthFailure = createAction(
  '[Auth] Load Stored Auth Failure'
);

export const clearAuthError = createAction(
  '[Auth] Clear Auth Error'
);
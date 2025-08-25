import { UserDto } from '../../models/auth/auth.model';

export interface AuthState {
  currentUser: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  currentUser: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null
};
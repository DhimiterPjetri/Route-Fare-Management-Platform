export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  tourOperatorId?: number;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: UserDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  tourOperatorId?: number;
  tourOperatorName?: string;
}

export enum UserRole {
  Admin = 'Admin',
  TourOperator = 'TourOperator'
}
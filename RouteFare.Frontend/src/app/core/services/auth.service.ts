import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { LoginDto, RegisterDto, TokenResponseDto, UserDto } from '../models/auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private apiService: ApiService
  ) {
    this.loadStoredAuth();
  }

  login(credentials: LoginDto): Observable<TokenResponseDto> {
    return this.apiService.post<TokenResponseDto>('Auth/login', credentials)
      .pipe(
        tap(response => {
          console.log('Raw API response:', response);
          this.setAuthData(response);
        })
      );
  }

  register(userData: RegisterDto): Observable<TokenResponseDto> {
    return this.apiService.post<TokenResponseDto>('Auth/register', userData)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  refreshToken(): Observable<TokenResponseDto> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.apiService.post<TokenResponseDto>('Auth/refresh', { refreshToken })
      .pipe(
        tap(response => this.setAuthData(response))
      );
  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const hasToken = !!token;
    console.log('AuthService - isAuthenticated check:', { token: !!token, hasToken });
    return hasToken;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Admin';
  }

  isTourOperator(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'TourOperator';
  }

  private setAuthData(response: TokenResponseDto): void {
    console.log('AuthService - setting auth data:', { 
      accessToken: !!response.accessToken, 
      user: response.user,
      hasToken: !!response.accessToken 
    });
    
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.currentUserSubject.next(response.user);
    this.tokenSubject.next(response.accessToken);
    
    console.log('AuthService - after setting:', {
      tokenSubjectValue: !!this.tokenSubject.value,
      isAuthenticatedNow: this.isAuthenticated()
    });
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(token);
      } catch (error) {
        this.logout();
      }
    }
  }
}
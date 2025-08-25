import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(action =>
        this.authService.login(action.credentials).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => of(AuthActions.loginFailure({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(action =>
        this.authService.register(action.userData).pipe(
          map(response => AuthActions.registerSuccess({ response })),
          catchError(error => of(AuthActions.registerFailure({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      exhaustMap(() =>
        this.authService.refreshToken().pipe(
          map(response => AuthActions.refreshTokenSuccess({ response })),
          catchError(error => of(AuthActions.refreshTokenFailure({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  loadStoredAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadStoredAuth),
      map(() => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        
        if (token && refreshToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            return AuthActions.loadStoredAuthSuccess({ user, token, refreshToken });
          } catch (error) {
            return AuthActions.loadStoredAuthFailure();
          }
        } else {
          return AuthActions.loadStoredAuthFailure();
        }
      })
    )
  );

  authSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess, AuthActions.refreshTokenSuccess, AuthActions.loadStoredAuthSuccess),
      tap(() => {
        this.signalRService.startConnection().catch(error => {
          console.warn('Failed to start SignalR connection:', error);
        });
      })
    ),
    { dispatch: false }
  );

  authSuccessRedirect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap((action) => {
        const user = action.response.user;
        if (user.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user.role === 'TourOperator') {
          this.router.navigate(['/tour-operator/dashboard']);
        }
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.signalRService.stopConnection();
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private signalRService: SignalRService,
    private router: Router
  ) {}
}
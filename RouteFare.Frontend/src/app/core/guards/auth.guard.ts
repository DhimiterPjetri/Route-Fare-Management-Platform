import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isAuth = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    
    console.log('AuthGuard - isAuthenticated:', isAuth);
    console.log('AuthGuard - current user:', user);
    
    if (isAuth) {
      return true;
    }

    console.log('AuthGuard - redirecting to login');
    this.router.navigate(['/auth/login']);
    return false;
  }
}
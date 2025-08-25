import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[];
    const currentUser = this.authService.getCurrentUser();
    
    console.log('RoleGuard - required roles:', requiredRoles);
    console.log('RoleGuard - current user:', currentUser);
    console.log('RoleGuard - user role:', currentUser?.role);
    console.log('RoleGuard - role type:', typeof currentUser?.role);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('RoleGuard - no roles required, allowing access');
      return true;
    }

    if (!currentUser) {
      console.log('RoleGuard - no current user, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    const hasRole = requiredRoles.includes(currentUser.role);
    console.log('RoleGuard - user has required role:', hasRole);
    
    if (hasRole) {
      console.log('RoleGuard - access granted');
      return true;
    }

    console.log('RoleGuard - access denied, redirecting to unauthorized');
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
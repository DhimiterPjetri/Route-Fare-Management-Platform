import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserDto, UserRole } from '../../../core/models/auth/auth.model';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  standalone: false
})
export class LeftMenuComponent implements OnInit, OnDestroy {
  
  menuItems: MenuItem[] = [];
  currentRoute: string = '';
  currentUser: UserDto | null = null;
  private destroy$ = new Subject<void>();

  private adminMenuItems: MenuItem[] = [
    {
      title: 'Routes',
      icon: 'route',
      route: '/admin/routes',
      color: '#1976d2'
    },
    {
      title: 'Seasons',
      icon: 'schedule',
      route: '/admin/seasons',
      color: '#388e3c'
    },
    {
      title: 'Tour Operators',
      icon: 'business',
      route: '/admin/tour-operators',
      color: '#f57c00'
    },
    {
      title: 'Booking Classes',
      icon: 'airline_seat_recline_extra',
      route: '/admin/booking-classes',
      color: '#7b1fa2'
    },
    {
      title: 'Pricing Overview',
      icon: 'attach_money',
      route: '/admin/pricing',
      color: '#d32f2f'
    }
  ];

  private tourOperatorMenuItems: MenuItem[] = [
    {
      title: 'My Routes',
      icon: 'route',
      route: '/tour-operator/routes',
      color: '#1976d2'
    },
    {
      title: 'Route Selection',
      icon: 'add_location_alt',
      route: '/tour-operator/route-selection',
      color: '#388e3c'
    },
    {
      title: 'Pricing Management',
      icon: 'attach_money',
      route: '/tour-operator/pricing',
      color: '#f57c00'
    },
    {
      title: 'Booking Classes',
      icon: 'airline_seat_recline_extra',
      route: '/tour-operator/booking-classes',
      color: '#7b1fa2'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.setMenuItems();
      });

    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setMenuItems(): void {
    if (!this.currentUser) {
      this.menuItems = [];
      return;
    }

    if (this.authService.isAdmin()) {
      this.menuItems = this.adminMenuItems;
    } else if (this.authService.isTourOperator()) {
      this.menuItems = this.tourOperatorMenuItems;
    } else {
      this.menuItems = [];
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get userDisplayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  get userRole(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role === UserRole.Admin ? 'Administrator' : 'Tour Operator';
  }
}
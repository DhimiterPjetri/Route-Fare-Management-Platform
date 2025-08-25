import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tour-operator-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  dashboardCards = [
    {
      title: 'My Routes',
      description: 'View and manage assigned routes for active seasons',
      icon: 'route',
      color: '#1976d2',
      action: () => this.navigateTo('/tour-operator/routes')
    },
    {
      title: 'Route Selection',
      description: 'Select routes for upcoming seasons',
      icon: 'add_location_alt',
      color: '#388e3c',
      action: () => this.navigateTo('/tour-operator/route-selection')
    },
    {
      title: 'Pricing Management',
      description: 'Manage daily pricing for your routes',
      icon: 'attach_money',
      color: '#f57c00',
      action: () => this.navigateTo('/tour-operator/pricing')
    },
    {
      title: 'Booking Classes',
      description: 'Configure your supported service classes',
      icon: 'airline_seat_recline_extra',
      color: '#7b1fa2',
      action: () => this.navigateTo('/tour-operator/booking-classes')
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
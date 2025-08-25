import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  dashboardCards = [
    {
      title: 'Routes',
      description: 'Manage travel routes and destinations',
      icon: 'route',
      color: '#1976d2',
      action: () => this.navigateTo('/admin/routes')
    },
    {
      title: 'Seasons',
      description: 'Manage seasonal periods and pricing',
      icon: 'schedule',
      color: '#388e3c',
      action: () => this.navigateTo('/admin/seasons')
    },
    {
      title: 'Tour Operators',
      description: 'Manage tour operator companies',
      icon: 'business',
      color: '#f57c00',
      action: () => this.navigateTo('/admin/tour-operators')
    },
    {
      title: 'Booking Classes',
      description: 'Manage service class types',
      icon: 'airline_seat_recline_extra',
      color: '#7b1fa2',
      action: () => this.navigateTo('/admin/booking-classes')
    },
    {
      title: 'Pricing Overview',
      description: 'View all pricing data across operators',
      icon: 'attach_money',
      color: '#d32f2f',
      action: () => this.navigateTo('/admin/pricing')
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    console.log('Navigate to:', route);
    this.router.navigate([route]);
  }
}
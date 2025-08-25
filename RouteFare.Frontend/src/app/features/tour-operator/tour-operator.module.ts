import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MyRoutesComponent } from './components/my-routes/my-routes.component';
import { RouteDetailsDialogComponent } from './components/my-routes/route-details-dialog/route-details-dialog.component';
import { RouteSelectionComponent } from './components/route-selection/route-selection.component';
import { PricingManagementComponent } from './components/pricing-management/pricing-management.component';
import { PricingDialogComponent } from './components/pricing-management/pricing-dialog/pricing-dialog.component';
import { BookingClassesComponent } from './components/booking-classes/booking-classes.component';

const routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full' as const
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'routes',
    component: MyRoutesComponent
  },
  {
    path: 'route-selection',
    component: RouteSelectionComponent
  },
  {
    path: 'pricing',
    component: PricingManagementComponent
  },
  {
    path: 'booking-classes',
    component: BookingClassesComponent
  }
];

@NgModule({
  declarations: [
    DashboardComponent,
    MyRoutesComponent,
    RouteDetailsDialogComponent,
    RouteSelectionComponent,
    PricingManagementComponent,
    PricingDialogComponent,
    BookingClassesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class TourOperatorModule { }
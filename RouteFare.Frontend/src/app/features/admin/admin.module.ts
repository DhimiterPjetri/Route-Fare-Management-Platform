import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RoutesListComponent } from './components/route-management/routes-list.component';
import { RouteDialogComponent } from './components/route-management/route-dialog/route-dialog.component';
import { RouteUsageDialogComponent } from './components/route-management/route-usage-dialog/route-usage-dialog.component';
import { SeasonsListComponent } from './components/season-management/seasons-list.component';
import { CreateSeasonsDialogComponent } from './components/season-management/create-seasons-dialog/create-seasons-dialog.component';
import { SeasonAssignmentsDialogComponent } from './components/season-management/season-assignments-dialog/season-assignments-dialog.component';
import { TourOperatorsListComponent } from './components/tour-operator-management/tour-operators-list.component';
import { TourOperatorDialogComponent } from './components/tour-operator-management/tour-operator-dialog/tour-operator-dialog.component';
import { TourOperatorDetailsDialogComponent } from './components/tour-operator-management/tour-operator-details-dialog/tour-operator-details-dialog.component';
import { TourOperatorRoutesDialogComponent } from './components/tour-operator-management/tour-operator-routes-dialog/tour-operator-routes-dialog.component';
import { BookingClassesListComponent } from './components/booking-class-management/booking-classes-list.component';
import { BookingClassDialogComponent } from './components/booking-class-management/booking-class-dialog/booking-class-dialog.component';
import { PricingOverviewComponent } from './components/pricing-overview/pricing-overview.component';

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
    component: RoutesListComponent
  },
  {
    path: 'seasons',
    component: SeasonsListComponent
  },
  {
    path: 'tour-operators',
    component: TourOperatorsListComponent
  },
  {
    path: 'booking-classes',
    component: BookingClassesListComponent
  },
  {
    path: 'pricing',
    component: PricingOverviewComponent
  }
];

@NgModule({
  declarations: [
    DashboardComponent,
    RoutesListComponent,
    RouteDialogComponent,
    RouteUsageDialogComponent,
    SeasonsListComponent,
    CreateSeasonsDialogComponent,
    SeasonAssignmentsDialogComponent,
    TourOperatorsListComponent,
    TourOperatorDialogComponent,
    TourOperatorDetailsDialogComponent,
    TourOperatorRoutesDialogComponent,
    BookingClassesListComponent,
    BookingClassDialogComponent,
    PricingOverviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
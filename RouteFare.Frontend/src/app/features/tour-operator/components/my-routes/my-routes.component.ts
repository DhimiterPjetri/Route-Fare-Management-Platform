import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ErrorHandlingService } from '../../../../core/services/error-handling.service';

import { TourOperatorRouteService } from '../../../../core/services/tour-operator-route.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TourOperatorRouteDto } from '../../../../core/models/tour-operator/tour-operator-route.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { RouteDetailsDialogComponent, RouteDetailsDialogData } from './route-details-dialog/route-details-dialog.component';

@Component({
  selector: 'app-my-routes',
  templateUrl: './my-routes.component.html',
  styleUrls: ['./my-routes.component.scss'],
  standalone: false,
  animations: [
    trigger('slideToggle', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-in-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class MyRoutesComponent implements OnInit, OnDestroy {

  routes: TourOperatorRouteDto[] = [];
  isLoading = false;
  error: string | null = null;

  displayedColumns = ['routeCode', 'origin', 'destination', 'bookingClasses', 'seasonName', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private tourOperatorRouteService: TourOperatorRouteService,
    private authService: AuthService,
    private dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.loadMyRoutes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyRoutes(): void {
    this.isLoading = true;
    this.error = null;

    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId) {
      this.error = 'Tour operator information not found';
      this.isLoading = false;
      return;
    }

    this.tourOperatorRouteService.getTourOperatorRoutes(tourOperatorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (routes) => {
          this.routes = routes;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  onViewDetails(route: TourOperatorRouteDto): void {
    this.tourOperatorRouteService.getTourOperatorRouteById(route.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (routeDetails) => {
          const dialogData: RouteDetailsDialogData = {
            route: routeDetails
          };

          this.dialog.open(RouteDetailsDialogComponent, {
            width: '600px',
            data: dialogData
          });
        },
        error: () => {
        }
      });
  }

  onRemoveRoute(route: TourOperatorRouteDto): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Remove Route Assignment',
      message: `Are you sure you want to remove the route "${route.routeCode}" from season "${route.seasonName}"?`,
      confirmText: 'Remove Route',
      cancelText: 'Cancel',
      isDestructive: true
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.removeRoute(route);
      }
    });
  }

  private removeRoute(route: TourOperatorRouteDto): void {
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId) return;

    this.tourOperatorRouteService.removeRouteFromSeason(tourOperatorId, route.routeId, route.seasonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadMyRoutes();
          this.errorHandlingService.showSuccessMessage('Route assignment removed successfully');
        },
        error: () => {
        }
      });
  }


}
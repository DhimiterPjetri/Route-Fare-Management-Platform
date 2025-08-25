import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, debounceTime } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ErrorHandlingService } from '../../../../core/services/error-handling.service';

import { RouteService } from '../../../../core/services/route.service';
import { TourOperatorRouteService } from '../../../../core/services/tour-operator-route.service';
import { RouteDto, RouteFilterDto } from '../../../../core/models/route/route.model';
import { PagedResult } from '../../../../core/models/common/api.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { RouteDialogComponent } from './route-dialog/route-dialog.component';
import { RouteUsageDialogComponent } from './route-usage-dialog/route-usage-dialog.component';

@Component({
  selector: 'app-routes-list',
  templateUrl: './routes-list.component.html',
  styleUrls: ['./routes-list.component.scss'],
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
export class RoutesListComponent implements OnInit, OnDestroy {
  
  routes: RouteDto[] = [];
  isLoading = false;
  
  totalCount = 0;
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 50];
  
  filterForm: FormGroup;
  showFilters = false;
  
  displayedColumns = ['routeCode', 'origin', 'destination', 'bookingClasses', 'isActive', 'createdAt', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private routeService: RouteService,
    private tourOperatorRouteService: TourOperatorRouteService,
    private dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      isActive: [null]
    });
  }

  ngOnInit(): void {
    this.setupFilterSubscription();
    this.loadRoutes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoutes(): void {
    this.isLoading = true;
    
    const formValue = this.filterForm.value;
    const filter: RouteFilterDto = {
      searchTerm: formValue.searchTerm || undefined,
      isActive: formValue.isActive ?? undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.routeService.getRoutes(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<RouteDto>) => {
          this.routes = result.items;
          this.totalCount = result.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRoutes();
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClearFilters(): void {
    this.filterForm.reset();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRoutes();
  }

  onNewRoute(): void {
    const dialogRef = this.dialog.open(RouteDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoutes();
        this.errorHandlingService.showSuccessMessage('Route created successfully');
      }
    });
  }

  onEdit(route: RouteDto): void {
    this.checkRouteUsage(route.id).then(inUse => {
      if (inUse) {
        this.errorHandlingService.showWarningMessage('Cannot edit route - it is assigned to tour operators');
        return;
      }

      const dialogRef = this.dialog.open(RouteDialogComponent, {
        width: '500px',
        data: { mode: 'edit', route }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadRoutes();
          this.errorHandlingService.showSuccessMessage('Route updated successfully');
        }
      });
    });
  }

  onDelete(route: RouteDto): void {
    this.checkRouteUsage(route.id).then(inUse => {
      if (inUse) {
        this.errorHandlingService.showWarningMessage('Cannot delete route - it is assigned to tour operators');
        return;
      }

      const dialogData: ConfirmationDialogData = {
        title: 'Delete Route',
        message: `Are you sure you want to delete the route "${route.routeCode}"?`,
        confirmText: 'Delete Route',
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
          this.routeService.deleteRoute(route.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.loadRoutes();
                this.errorHandlingService.showSuccessMessage('Route deleted successfully');
              },
              error: () => {
              }
            });
        }
      });
    });
  }

  onViewUsage(route: RouteDto): void {
    this.tourOperatorRouteService.getByRouteId(route.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignments) => {
          this.dialog.open(RouteUsageDialogComponent, {
            width: '600px',
            data: { route, assignments }
          });
        },
        error: () => {
        }
      });
  }

  private async checkRouteUsage(routeId: number): Promise<boolean> {
    try {
      const assignments = await this.tourOperatorRouteService.getByRouteId(routeId).toPromise();
      return !!(assignments && assignments.length > 0);
    } catch (error) {
      return false; 
    }
  }


  getActiveStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getActiveStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }
}
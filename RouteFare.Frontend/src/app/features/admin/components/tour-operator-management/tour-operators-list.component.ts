import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime } from 'rxjs/operators';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { TourOperatorService } from '../../../../core/services/tour-operator.service';
import { TourOperatorDto, TourOperatorFilterDto } from '../../../../core/models/tour-operator/tour-operator.model';
import { PagedResult } from '../../../../core/models/common/api.model';
import { StatusToggleDialogComponent, StatusToggleDialogData } from '../../../../shared/components/status-toggle-dialog/status-toggle-dialog.component';
import { TourOperatorDialogComponent, TourOperatorDialogData } from './tour-operator-dialog/tour-operator-dialog.component';
import { TourOperatorDetailsDialogComponent, TourOperatorDetailsDialogData } from './tour-operator-details-dialog/tour-operator-details-dialog.component';
import { TourOperatorRoutesDialogComponent, TourOperatorRoutesDialogData } from './tour-operator-routes-dialog/tour-operator-routes-dialog.component';

@Component({
  selector: 'app-tour-operators-list',
  templateUrl: './tour-operators-list.component.html',
  styleUrls: ['./tour-operators-list.component.scss'],
  standalone: false
})
export class TourOperatorsListComponent implements OnInit, OnDestroy {
  
  displayedColumns: string[] = ['name', 'contactEmail', 'phoneNumber', 'isActive', 'actions'];
  tourOperators: TourOperatorDto[] = [];
  totalCount = 0;
  isLoading = false;
  
  filterForm: FormGroup;
  showFilters = false;
  currentPage = 1;
  pageSize = 10;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private tourOperatorService: TourOperatorService,
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
    this.loadTourOperators();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTourOperators(): void {
    this.isLoading = true;
    
    const formValue = this.filterForm.value;
    const filter: TourOperatorFilterDto = {
      searchTerm: formValue.searchTerm || undefined,
      isActive: formValue.isActive ?? undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };
    
    this.tourOperatorService.getTourOperators(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<TourOperatorDto>) => {
          this.tourOperators = result.items;
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
        this.loadTourOperators();
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClearFilters(): void {
    this.filterForm.reset();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTourOperators();
  }

  onNewTourOperator(): void {
    const dialogData: TourOperatorDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(TourOperatorDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTourOperators();
        this.errorHandlingService.showSuccessMessage('Tour operator created successfully');
      }
    });
  }

  onEditTourOperator(tourOperator: TourOperatorDto): void {
    const dialogData: TourOperatorDialogData = {
      mode: 'edit',
      tourOperator: tourOperator
    };

    const dialogRef = this.dialog.open(TourOperatorDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTourOperators();
        this.errorHandlingService.showSuccessMessage('Tour operator updated successfully');
      }
    });
  }

  onToggleStatus(tourOperator: TourOperatorDto): void {
    const actionType = tourOperator.isActive ? 'deactivate' : 'activate';
    
    const dialogData: StatusToggleDialogData = {
      objectType: 'Tour Operator',
      objectName: tourOperator.name,
      currentStatus: tourOperator.isActive,
      actionType: actionType
    };

    const dialogRef = this.dialog.open(StatusToggleDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const updateDto = {
          ...tourOperator,
          isActive: !tourOperator.isActive
        };

        this.tourOperatorService.updateTourOperator(updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadTourOperators();
              this.errorHandlingService.showSuccessMessage(`Tour operator ${actionType}d successfully`);
            },
            error: () => {
            }
          });
      }
    });
  }

  onViewDetails(tourOperator: TourOperatorDto): void {
    const dialogData: TourOperatorDetailsDialogData = {
      tourOperatorId: tourOperator.id
    };

    this.dialog.open(TourOperatorDetailsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });
  }

  onViewRoutes(tourOperator: TourOperatorDto): void {
    const dialogData: TourOperatorRoutesDialogData = {
      tourOperator: tourOperator
    };

    this.dialog.open(TourOperatorRoutesDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });
  }


  getActiveStatusText(isActive: boolean): string {
    return isActive ? 'ACTIVE' : 'INACTIVE';
  }

  getActiveStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

}
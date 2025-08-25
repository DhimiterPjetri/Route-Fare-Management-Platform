import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';

import { BookingClassService } from '../../../../core/services/booking-class.service';
import { TourOperatorService } from '../../../../core/services/tour-operator.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BookingClassDto } from '../../../../core/models/booking-class/booking-class.model';
import { TourOperatorDto } from '../../../../core/models/tour-operator/tour-operator.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-booking-classes',
  templateUrl: './booking-classes.component.html',
  styleUrls: ['./booking-classes.component.scss'],
  standalone: false
})
export class BookingClassesComponent implements OnInit, OnDestroy {

  isLoading = false;
  isSaving = false;
  
  allClasses: BookingClassDto[] = [];
  myClasses: BookingClassDto[] = [];
  tourOperator: TourOperatorDto | null = null;
  
  hasChanges = false;
  originalSelectedIds: Set<number> = new Set();
  selectedClassIds: Set<number> = new Set();
  
  private destroy$ = new Subject<void>();

  constructor(
    private bookingClassService: BookingClassService,
    private tourOperatorService: TourOperatorService,
    private authService: AuthService,
    private dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId) {
      this.isLoading = false;
      return;
    }

    Promise.all([
      this.bookingClassService.getBookingClasses().toPromise(),
      this.bookingClassService.getTourOperatorBookingClasses(tourOperatorId).toPromise(),
      this.tourOperatorService.getTourOperator(tourOperatorId).toPromise()
    ]).then(([allClasses, myClasses, tourOperator]) => {
      this.allClasses = allClasses || [];
      this.myClasses = myClasses || [];
      this.tourOperator = tourOperator || null;
      
      this.selectedClassIds = new Set(this.myClasses.map(c => c.id));
      this.originalSelectedIds = new Set(this.selectedClassIds);
      
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  onClassToggle(classItem: BookingClassDto): void {
    if (this.selectedClassIds.has(classItem.id)) {
      this.selectedClassIds.delete(classItem.id);
    } else {
      this.selectedClassIds.add(classItem.id);
    }
    
    this.updateHasChanges();
  }

  private updateHasChanges(): void {
    const currentIds = Array.from(this.selectedClassIds).sort();
    const originalIds = Array.from(this.originalSelectedIds).sort();
    
    this.hasChanges = JSON.stringify(currentIds) !== JSON.stringify(originalIds);
  }

  isClassSelected(classItem: BookingClassDto): boolean {
    return this.selectedClassIds.has(classItem.id);
  }

  onResetChanges(): void {
    this.selectedClassIds = new Set(this.originalSelectedIds);
    this.updateHasChanges();
    this.errorHandlingService.showSuccessMessage('Changes reset successfully');
  }

  onSaveChanges(): void {
    if (!this.hasChanges) {
      return;
    }

    if (this.selectedClassIds.size === 0) {
      this.errorHandlingService.showWarningMessage('Please select at least one booking class');
      return;
    }

    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId || !this.tourOperator) {
      this.errorHandlingService.showWarningMessage('Tour operator information not found');
      return;
    }

    const removedClasses = this.myClasses.filter(c => !this.selectedClassIds.has(c.id));
    if (removedClasses.length > 0) {
      this.confirmClassChanges(removedClasses);
    } else {
      this.saveChanges();
    }
  }

  private confirmClassChanges(removedClasses: BookingClassDto[]): void {
    const classNames = removedClasses.map(c => c.name).join(', ');
    
    const dialogData: ConfirmationDialogData = {
      title: 'Confirm Class Changes',
      message: `You are removing the following booking classes: ${classNames}. This may affect your existing pricing configuration. Do you want to continue?`,
      confirmText: 'Update Classes',
      cancelText: 'Cancel',
      isDestructive: true
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.saveChanges();
      }
    });
  }

  private saveChanges(): void {
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId || !this.tourOperator) return;

    const updateData = {
      ...this.tourOperator,
      bookingClassIds: Array.from(this.selectedClassIds)
    };

    this.isSaving = true;

    this.tourOperatorService.updateTourOperator(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTourOperator) => {
          this.tourOperator = updatedTourOperator;
          this.myClasses = updatedTourOperator.bookingClasses || [];
          this.originalSelectedIds = new Set(this.selectedClassIds);
          this.updateHasChanges();
          
          this.errorHandlingService.showSuccessMessage('Booking classes updated successfully');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  getClassDescription(classItem: BookingClassDto): string {
    const parts = [];
    if (classItem.multiplier && classItem.multiplier !== 1) {
      parts.push(`${classItem.multiplier}x pricing`);
    }
    return parts.join(', ');
  }

  getSelectionSummary(): string {
    const selectedCount = this.selectedClassIds.size;
    const totalCount = this.allClasses.length;
    
    if (selectedCount === 0) {
      return 'No classes selected';
    } else if (selectedCount === 1) {
      return '1 class selected';
    } else {
      return `${selectedCount} of ${totalCount} classes selected`;
    }
  }

}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ErrorHandlingService } from '../../../../core/services/error-handling.service';

import { BookingClassService } from '../../../../core/services/booking-class.service';
import { BookingClassDto, BookingClassType } from '../../../../core/models/booking-class/booking-class.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { StatusToggleDialogComponent, StatusToggleDialogData } from '../../../../shared/components/status-toggle-dialog/status-toggle-dialog.component';
import { BookingClassDialogComponent, BookingClassDialogData } from './booking-class-dialog/booking-class-dialog.component';

@Component({
  selector: 'app-booking-classes-list',
  templateUrl: './booking-classes-list.component.html',
  styleUrls: ['./booking-classes-list.component.scss'],
  standalone: false
})
export class BookingClassesListComponent implements OnInit, OnDestroy {
  
  displayedColumns: string[] = ['name', 'code', 'isActive', 'actions'];
  bookingClasses: BookingClassDto[] = [];
  isLoading = false;
  
  
  BookingClassType = BookingClassType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private bookingClassService: BookingClassService,
    private dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.loadBookingClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookingClasses(): void {
    this.isLoading = true;
    
    this.bookingClassService.getBookingClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes: BookingClassDto[]) => {
          this.bookingClasses = classes;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }


  onNewBookingClass(): void {
    const dialogData: BookingClassDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(BookingClassDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBookingClasses();
        this.errorHandlingService.showSuccessMessage('Booking class created successfully');
      }
    });
  }

  onEditBookingClass(bookingClass: BookingClassDto): void {
    const dialogData: BookingClassDialogData = {
      mode: 'edit',
      bookingClass: bookingClass
    };

    const dialogRef = this.dialog.open(BookingClassDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBookingClasses();
        this.errorHandlingService.showSuccessMessage('Booking class updated successfully');
      }
    });
  }

  onToggleStatus(bookingClass: BookingClassDto): void {
    const actionType = bookingClass.isActive ? 'deactivate' : 'activate';
    
    const dialogData: StatusToggleDialogData = {
      objectType: 'Booking Class',
      objectName: bookingClass.name,
      currentStatus: bookingClass.isActive,
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
          ...bookingClass,
          isActive: !bookingClass.isActive
        };

        this.bookingClassService.updateBookingClass(updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadBookingClasses();
              this.errorHandlingService.showSuccessMessage(`Booking class ${actionType}d successfully`);
            },
            error: () => {
            }
          });
      }
    });
  }

  onDeleteBookingClass(bookingClass: BookingClassDto): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Delete Booking Class',
      message: `Are you sure you want to delete the booking class "${bookingClass.name}"?`,
      confirmText: 'Delete Booking Class',
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
        this.bookingClassService.deleteBookingClass(bookingClass.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadBookingClasses();
              this.errorHandlingService.showSuccessMessage('Booking class deleted successfully');
            },
            error: () => {
            }
          });
      }
    });
  }

  onViewUsage(bookingClass: BookingClassDto): void {
    this.errorHandlingService.showWarningMessage(`Usage dialog for "${bookingClass.name}" not implemented yet`);
  }


  getActiveStatusText(isActive: boolean): string {
    return isActive ? 'ACTIVE' : 'INACTIVE';
  }

  getActiveStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getClassTypeName(classType: BookingClassType): string {
    switch (classType) {
      case BookingClassType.Economy:
        return 'Economy';
      case BookingClassType.PremiumEconomy:
        return 'Premium Economy';
      case BookingClassType.Business:
        return 'Business';
      case BookingClassType.FirstClass:
        return 'First Class';
      default:
        return 'Unknown';
    }
  }

}
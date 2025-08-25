import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouteService } from '../../../../../core/services/route.service';
import { BookingClassService } from '../../../../../core/services/booking-class.service';
import { ErrorHandlingService } from '../../../../../core/services/error-handling.service';
import { RouteDto, CreateRouteDto, UpdateRouteDto } from '../../../../../core/models/route/route.model';
import { BookingClassDto } from '../../../../../core/models/booking-class/booking-class.model';

export interface RouteDialogData {
  mode: 'create' | 'edit';
  route?: RouteDto;
}

@Component({
  selector: 'app-route-dialog',
  templateUrl: './route-dialog.component.html',
  styleUrls: ['./route-dialog.component.scss'],
  standalone: false
})
export class RouteDialogComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  allBookingClasses: BookingClassDto[] = [];
  isLoadingBookingClasses = false;

  constructor(
    private fb: FormBuilder,
    private routeService: RouteService,
    private bookingClassService: BookingClassService,
    private errorHandlingService: ErrorHandlingService,
    private dialogRef: MatDialogRef<RouteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RouteDialogData
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadBookingClasses();
    
    if (this.data.mode === 'edit' && this.data.route) {
      this.form.patchValue({
        origin: this.data.route.origin,
        destination: this.data.route.destination,
        isActive: this.data.route.isActive,
        bookingClassIds: this.data.route.availableBookingClasses.map(bc => bc.id)
      });
    }
    
    this.dialogRef.disableClose = true;
  }

  private loadBookingClasses(): void {
    this.isLoadingBookingClasses = true;
    
    this.bookingClassService.getBookingClasses().subscribe({
      next: (classes) => {
        this.allBookingClasses = classes.sort((a, b) => a.displayOrder - b.displayOrder);
        this.isLoadingBookingClasses = false;
      },
      error: () => {
        this.isLoadingBookingClasses = false;
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      origin: ['', [Validators.required, Validators.maxLength(100)]],
      destination: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true, Validators.required],
      bookingClassIds: [[], [Validators.required, this.minSelectedValidator(1)]]
    });
  }

  private minSelectedValidator(min: number) {
    return (control: any) => {
      const value = control.value;
      return value && Array.isArray(value) && value.length >= min ? null : { minSelected: { min } };
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValue = this.form.value;

    if (this.data.mode === 'create') {
      const createDto: CreateRouteDto = {
        origin: formValue.origin.trim(),
        destination: formValue.destination.trim(),
        isActive: formValue.isActive,
        bookingClassIds: formValue.bookingClassIds
      };

      this.routeService.createRoute(createDto).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else if (this.data.route) {
      const updateDto: UpdateRouteDto = {
        id: this.data.route.id,
        origin: formValue.origin.trim(),
        destination: formValue.destination.trim(),
        isActive: formValue.isActive,
        bookingClassIds: formValue.bookingClassIds
      };

      this.routeService.updateRoute(updateDto).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.data.mode === 'create' ? 'Create New Route' : 'Edit Route';
  }

  getSubmitButtonText(): string {
    if (this.isLoading) {
      return this.data.mode === 'create' ? 'Creating...' : 'Updating...';
    }
    return this.data.mode === 'create' ? 'Create Route' : 'Update Route';
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    if (field.errors['minSelected']) {
      return 'At least one booking class must be selected';
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      origin: 'Origin',
      destination: 'Destination'
    };
    return labels[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  onBookingClassToggle(bookingClassId: number, checked: boolean): void {
    const currentIds = this.form.get('bookingClassIds')?.value || [];
    let newIds: number[];
    
    if (checked) {
      newIds = [...currentIds, bookingClassId];
    } else {
      newIds = currentIds.filter((id: number) => id !== bookingClassId);
    }
    
    this.form.patchValue({ bookingClassIds: newIds });
  }

  getRouteCodePreview(): string {
    const origin = this.form.get('origin')?.value?.trim();
    const destination = this.form.get('destination')?.value?.trim();
    
    if (!origin || !destination) {
      return 'Route code will be auto-generated';
    }

    const originCode = origin.substring(0, 3).toUpperCase();
    const destCode = destination.substring(0, 3).toUpperCase();
    return `${originCode}-${destCode}`;
  }
}
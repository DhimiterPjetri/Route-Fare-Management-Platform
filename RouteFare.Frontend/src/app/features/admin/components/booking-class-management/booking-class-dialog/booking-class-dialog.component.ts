import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingClassService } from '../../../../../core/services/booking-class.service';
import { ErrorHandlingService } from '../../../../../core/services/error-handling.service';
import { BookingClassDto, BookingClassType } from '../../../../../core/models/booking-class/booking-class.model';

export interface BookingClassDialogData {
  mode: 'create' | 'edit';
  bookingClass?: BookingClassDto;
}

export interface CreateBookingClassDto {
  name: string;
  code: string;
  classType: BookingClassType;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateBookingClassDto {
  id: number;
  name: string;
  code: string;
  classType: BookingClassType;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

@Component({
  selector: 'app-booking-class-dialog',
  templateUrl: './booking-class-dialog.component.html',
  styleUrls: ['./booking-class-dialog.component.scss'],
  standalone: false
})
export class BookingClassDialogComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookingClassService: BookingClassService,
    private errorHandlingService: ErrorHandlingService,
    private dialogRef: MatDialogRef<BookingClassDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingClassDialogData
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.bookingClass) {
      this.form.patchValue({
        name: this.data.bookingClass.name,
        code: this.data.bookingClass.code,
        classType: this.data.bookingClass.classType,
        description: this.data.bookingClass.description,
        displayOrder: this.data.bookingClass.displayOrder,
        isActive: this.data.bookingClass.isActive
      });
    }
    
    this.dialogRef.disableClose = true;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      code: ['', [Validators.required, Validators.maxLength(10)]],
      classType: [BookingClassType.Economy, Validators.required],
      description: [''],
      displayOrder: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      isActive: [true, Validators.required]
    });
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
      const createDto: CreateBookingClassDto = {
        name: formValue.name.trim(),
        code: formValue.code.trim().toUpperCase(),
        classType: formValue.classType,
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.bookingClassService.createBookingClass(createDto).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else if (this.data.bookingClass) {
      const updateDto: UpdateBookingClassDto = {
        id: this.data.bookingClass.id,
        name: formValue.name.trim(),
        code: formValue.code.trim().toUpperCase(),
        classType: formValue.classType,
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.bookingClassService.updateBookingClass(updateDto).subscribe({
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
    return this.data.mode === 'create' ? 'Create New Booking Class' : 'Edit Booking Class';
  }

  getSubmitButtonText(): string {
    if (this.isLoading) {
      return this.data.mode === 'create' ? 'Creating...' : 'Updating...';
    }
    return this.data.mode === 'create' ? 'Create Booking Class' : 'Update Booking Class';
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['max'].max}`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      code: 'Code',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }
}
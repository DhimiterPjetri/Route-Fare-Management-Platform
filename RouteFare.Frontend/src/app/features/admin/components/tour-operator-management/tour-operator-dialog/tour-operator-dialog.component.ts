import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TourOperatorService } from '../../../../../core/services/tour-operator.service';
import { BookingClassService } from '../../../../../core/services/booking-class.service';
import { TourOperatorDto } from '../../../../../core/models/tour-operator/tour-operator.model';
import { BookingClassDto } from '../../../../../core/models/booking-class/booking-class.model';
import { ErrorHandlingService } from '../../../../../core/services/error-handling.service';

export interface TourOperatorDialogData {
  mode: 'create' | 'edit';
  tourOperator?: TourOperatorDto;
}

export interface CreateTourOperatorDto {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  bookingClassIds: number[];
  initialUser?: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export interface UpdateTourOperatorDto {
  id: number;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
}

@Component({
  selector: 'app-tour-operator-dialog',
  templateUrl: './tour-operator-dialog.component.html',
  styleUrls: ['./tour-operator-dialog.component.scss'],
  standalone: false
})
export class TourOperatorDialogComponent implements OnInit {

  form: FormGroup;
  userForm: FormGroup;
  isLoading = false;
  bookingClasses: BookingClassDto[] = [];
  showUserForm = false;

  constructor(
    private fb: FormBuilder,
    private tourOperatorService: TourOperatorService,
    private bookingClassService: BookingClassService,
    private dialogRef: MatDialogRef<TourOperatorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TourOperatorDialogData,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.form = this.createForm();
    this.userForm = this.createUserForm();
  }

  ngOnInit(): void {
    this.loadBookingClasses();
    
    if (this.data.mode === 'edit' && this.data.tourOperator) {
      this.form.patchValue({
        name: this.data.tourOperator.name,
        code: this.data.tourOperator.code,
        contactEmail: this.data.tourOperator.contactEmail,
        contactPhone: this.data.tourOperator.contactPhone,
        isActive: this.data.tourOperator.isActive
      });
    } else {
      this.showUserForm = true;
    }
    
    this.dialogRef.disableClose = true;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required]],
      bookingClassIds: [[], this.data.mode === 'create' ? [Validators.required] : []],
      isActive: [true, Validators.required]
    });
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    });
  }

  private loadBookingClasses(): void {
    this.bookingClassService.getBookingClasses().subscribe({
      next: (classes) => {
        this.bookingClasses = classes.filter(c => c.isActive);
      },
      error: () => {
        this.errorHandlingService.showWarningMessage('Failed to load booking classes');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || (this.showUserForm && this.userForm.invalid)) {
      this.form.markAllAsTouched();
      if (this.showUserForm) this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;

    if (this.data.mode === 'create') {
      const createDto: CreateTourOperatorDto = {
        name: formValue.name.trim(),
        code: formValue.code.trim(),
        contactEmail: formValue.contactEmail.trim(),
        contactPhone: formValue.contactPhone.trim(),
        bookingClassIds: formValue.bookingClassIds || [],
        initialUser: this.showUserForm ? {
          email: this.userForm.value.email.trim(),
          password: this.userForm.value.password,
          firstName: this.userForm.value.firstName.trim(),
          lastName: this.userForm.value.lastName.trim()
        } : undefined
      };

      this.tourOperatorService.createTourOperator(createDto).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else if (this.data.tourOperator) {
      const updateDto: UpdateTourOperatorDto = {
        id: this.data.tourOperator.id,
        name: formValue.name.trim(),
        code: formValue.code.trim(),
        contactEmail: formValue.contactEmail.trim(),
        contactPhone: formValue.contactPhone.trim(),
        isActive: formValue.isActive
      };

      this.tourOperatorService.updateTourOperator(updateDto).subscribe({
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
    return this.data.mode === 'create' ? 'Create New Tour Operator' : 'Edit Tour Operator';
  }

  getSubmitButtonText(): string {
    if (this.isLoading) {
      return this.data.mode === 'create' ? 'Creating...' : 'Updating...';
    }
    return this.data.mode === 'create' ? 'Create Tour Operator' : 'Update Tour Operator';
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.form): string {
    const field = formGroup.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Company Name',
      code: 'Company Code',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
      bookingClassIds: 'Booking Classes',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name'
    };
    return labels[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string, formGroup: FormGroup = this.form): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

}
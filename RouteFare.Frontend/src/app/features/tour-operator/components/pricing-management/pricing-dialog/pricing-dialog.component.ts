import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PricingService } from '../../../../../core/services/pricing.service';
import { BookingClassDto } from '../../../../../core/models/booking-class/booking-class.model';
import { PricingRowDto, ClassPricingDto } from '../../../../../core/models/pricing/pricing-table.model';

export interface PricingDialogData {
  pricingRow: PricingRowDto;
  availableBookingClasses: BookingClassDto[];
  tourOperatorRouteId: number;
}

export interface PricingUpdateItem {
  date: Date;
  bookingClassId: number;
  bookingClassName: string;
  price: number;
  requestedSeats: number;
}

@Component({
  selector: 'app-pricing-dialog',
  templateUrl: './pricing-dialog.component.html',
  styleUrls: ['./pricing-dialog.component.scss'],
  standalone: false
})
export class PricingDialogComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  pricingItems: PricingUpdateItem[] = [];

  constructor(
    private fb: FormBuilder,
    private pricingService: PricingService,
    private dialogRef: MatDialogRef<PricingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PricingDialogData
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.initializePricingItems();
    this.dialogRef.disableClose = true;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      pricingUpdates: this.fb.array([])
    });
  }

  private initializePricingItems(): void {
    this.pricingItems = this.data.availableBookingClasses.map(bookingClass => {
      const existingPricing = this.data.pricingRow.classPricing.find(
        cp => cp.bookingClassId === bookingClass.id
      );

      return {
        date: this.data.pricingRow.date,
        bookingClassId: bookingClass.id,
        bookingClassName: bookingClass.name,
        price: existingPricing?.price || 0,
        requestedSeats: existingPricing?.requestedSeats || 0
      };
    });

    this.buildFormArray();
  }

  private buildFormArray(): void {
    const formGroups = this.pricingItems.map(item => 
      this.fb.group({
        bookingClassId: [item.bookingClassId],
        price: [item.price, [Validators.required, Validators.min(0)]],
        requestedSeats: [item.requestedSeats, [Validators.required, Validators.min(0)]]
      })
    );

    this.form.setControl('pricingUpdates', this.fb.array(formGroups));
  }

  isPricingFormValid(): boolean {
    return this.form.valid;
  }

  get pricingUpdatesArray(): FormArray {
    return this.form.get('pricingUpdates') as FormArray;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValues = this.form.value.pricingUpdates;
    const updates = formValues.map((update: any, index: number) => ({
      date: this.data.pricingRow.date,
      bookingClassId: update.bookingClassId,
      price: update.price,
      requestedSeats: update.requestedSeats
    }));

    const updateDto = {
      tourOperatorRouteId: this.data.tourOperatorRouteId,
      updates: updates
    };

    this.pricingService.updatePricing(updateDto).subscribe({
      next: (result) => {
        this.dialogRef.close(result);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return 'Edit Individual Pricing';
  }

  getSubmitButtonText(): string {
    return this.isLoading ? 'Updating...' : 'Update Pricing';
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFieldError(arrayIndex: number, fieldName: string): string {
    const control = this.pricingUpdatesArray.at(arrayIndex).get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      price: 'Price',
      requestedSeats: 'Requested Seats'
    };
    return labels[fieldName] || fieldName;
  }

  hasFieldError(arrayIndex: number, fieldName: string): boolean {
    const control = this.pricingUpdatesArray.at(arrayIndex).get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
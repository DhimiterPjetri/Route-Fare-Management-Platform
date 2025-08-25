import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TourOperatorService } from '../../../../../core/services/tour-operator.service';
import { TourOperatorDto } from '../../../../../core/models/tour-operator/tour-operator.model';

export interface TourOperatorDetailsDialogData {
  tourOperatorId: number;
}

@Component({
  selector: 'app-tour-operator-details-dialog',
  templateUrl: './tour-operator-details-dialog.component.html',
  styleUrls: ['./tour-operator-details-dialog.component.scss'],
  standalone: false
})
export class TourOperatorDetailsDialogComponent implements OnInit {
  
  tourOperator: TourOperatorDto | null = null;
  isLoading = true;

  constructor(
    private tourOperatorService: TourOperatorService,
    private dialogRef: MatDialogRef<TourOperatorDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TourOperatorDetailsDialogData
  ) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
    this.loadTourOperatorDetails();
  }

  loadTourOperatorDetails(): void {
    this.isLoading = true;
    this.tourOperatorService.getTourOperator(this.data.tourOperatorId).subscribe({
      next: (tourOperator: TourOperatorDto) => {
        this.tourOperator = tourOperator;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getStatusClass(): string {
    return this.tourOperator?.isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(): string {
    return this.tourOperator?.isActive ? 'Active' : 'Inactive';
  }
}
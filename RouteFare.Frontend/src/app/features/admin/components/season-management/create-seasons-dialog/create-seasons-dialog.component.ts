import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SeasonService } from '../../../../../core/services/season.service';

export interface CreateSeasonsDialogData {
  year: number;
}

@Component({
  selector: 'app-create-seasons-dialog',
  templateUrl: './create-seasons-dialog.component.html',
  styleUrls: ['./create-seasons-dialog.component.scss'],
  standalone: false
})
export class CreateSeasonsDialogComponent implements OnInit {
  isCreating = false;
  selectedYear: number;
  availableYears: number[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateSeasonsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateSeasonsDialogData,
    private seasonService: SeasonService,
  ) {
    this.selectedYear = this.data.year;
    this.generateAvailableYears();
  }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
  }

  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 5; year++) {
      this.availableYears.push(year);
    }
  }

  onYearChange(): void {
  }

  onCreateSeasons(): void {
    this.isCreating = true;

    const createSeasonDto = {
      year: this.selectedYear,
      isActive: true
    };

    this.seasonService.createSeason(createSeasonDto).subscribe({
      next: () => {
        this.isCreating = false;
        this.dialogRef.close({ year: this.selectedYear, created: true });
      },
      error: () => {
        this.isCreating = false;
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }
}
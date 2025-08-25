import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SeasonDto } from '../../../../../core/models/season/season.model';
import { TourOperatorRouteDto } from '../../../../../core/models/tour-operator/tour-operator-route.model';

export interface SeasonAssignmentsDialogData {
  season: SeasonDto;
  assignments: TourOperatorRouteDto[];
}

@Component({
  selector: 'app-season-assignments-dialog',
  templateUrl: './season-assignments-dialog.component.html',
  styleUrls: ['./season-assignments-dialog.component.scss'],
  standalone: false
})
export class SeasonAssignmentsDialogComponent implements OnInit {
  isLoading = true;

  constructor(
    private dialogRef: MatDialogRef<SeasonAssignmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SeasonAssignmentsDialogData
  ) {
    if (this.data.assignments && this.data.assignments.length >= 0) {
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  hasAssignments(): boolean {
    return this.data.assignments && this.data.assignments.length > 0;
  }

  getTourOperatorName(assignment: TourOperatorRouteDto): string {
    return assignment.tourOperatorName || 'Unknown Operator';
  }

  getRouteName(assignment: TourOperatorRouteDto): string {
    return assignment.routeCode || 'Unknown Route';
  }

  getRouteFullName(assignment: TourOperatorRouteDto): string {
    return this.getRouteName(assignment);
  }

  getAssignmentDate(assignment: TourOperatorRouteDto): Date | null {
    return assignment.assignedAt || null;
  }
}
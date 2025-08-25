import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouteDto } from '../../../../../core/models/route/route.model';
import { TourOperatorRouteDto } from '../../../../../core/models/tour-operator/tour-operator-route.model';

export interface RouteUsageDialogData {
  route: RouteDto;
  assignments: TourOperatorRouteDto[];
}

@Component({
  selector: 'app-route-usage-dialog',
  templateUrl: './route-usage-dialog.component.html',
  styleUrls: ['./route-usage-dialog.component.scss'],
  standalone: false
})
export class RouteUsageDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<RouteUsageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RouteUsageDialogData
  ) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getSeasonName(assignment: TourOperatorRouteDto): string {
    return assignment.seasonName || 'Unknown Season';
  }

  getTourOperatorName(assignment: TourOperatorRouteDto): string {
    return assignment.tourOperatorName || 'Unknown Operator';
  }

  hasAssignments(): boolean {
    return this.data.assignments && this.data.assignments.length > 0;
  }
}
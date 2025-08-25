import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TourOperatorRouteDto } from '../../../../../core/models/tour-operator/tour-operator-route.model';

export interface RouteDetailsDialogData {
  route: TourOperatorRouteDto;
}

@Component({
  selector: 'app-route-details-dialog',
  templateUrl: './route-details-dialog.component.html',
  styleUrls: ['./route-details-dialog.component.scss'],
  standalone: false
})
export class RouteDetailsDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<RouteDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RouteDetailsDialogData
  ) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
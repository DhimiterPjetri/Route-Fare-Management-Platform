import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TourOperatorRouteService } from '../../../../../core/services/tour-operator-route.service';
import { TourOperatorDto } from '../../../../../core/models/tour-operator/tour-operator.model';
import { TourOperatorRouteDto } from '../../../../../core/models/tour-operator/tour-operator-route.model';

export interface TourOperatorRoutesDialogData {
  tourOperator: TourOperatorDto;
}

@Component({
  selector: 'app-tour-operator-routes-dialog',
  templateUrl: './tour-operator-routes-dialog.component.html',
  styleUrls: ['./tour-operator-routes-dialog.component.scss'],
  standalone: false
})
export class TourOperatorRoutesDialogComponent implements OnInit {
  
  routes: TourOperatorRouteDto[] = [];
  isLoading = true;

  constructor(
    private tourOperatorRouteService: TourOperatorRouteService,
    private dialogRef: MatDialogRef<TourOperatorRoutesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TourOperatorRoutesDialogData
  ) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
    this.loadOperatorRoutes();
  }

  private loadOperatorRoutes(): void {
    this.tourOperatorRouteService.getTourOperatorRoutes(this.data.tourOperator.id).subscribe({
      next: (routes: TourOperatorRouteDto[]) => {
        this.routes = routes;
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

  hasRoutes(): boolean {
    return this.routes && this.routes.length > 0;
  }

  getRouteCode(route: TourOperatorRouteDto): string {
    return route.routeCode || 'Unknown Route';
  }

  getSeasonName(route: TourOperatorRouteDto): string {
    return route.seasonName || 'Unknown Season';
  }

  getAssignmentDate(route: TourOperatorRouteDto): Date | null {
    return route.assignedAt || null;
  }
}
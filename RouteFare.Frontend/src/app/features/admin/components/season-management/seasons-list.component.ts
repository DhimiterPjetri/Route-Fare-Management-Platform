import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ErrorHandlingService } from '../../../../core/services/error-handling.service';

import { SeasonService } from '../../../../core/services/season.service';
import { TourOperatorRouteService } from '../../../../core/services/tour-operator-route.service';
import { SeasonDto, SeasonType, SeasonFilterDto } from '../../../../core/models/season/season.model';
import { CreateSeasonsDialogComponent } from './create-seasons-dialog/create-seasons-dialog.component';
import { SeasonAssignmentsDialogComponent } from './season-assignments-dialog/season-assignments-dialog.component';
import { StatusToggleDialogComponent, StatusToggleDialogData } from '../../../../shared/components/status-toggle-dialog/status-toggle-dialog.component';

interface YearGroup {
  year: number;
  seasons: SeasonDto[];
}

@Component({
  selector: 'app-seasons-list',
  templateUrl: './seasons-list.component.html',
  styleUrls: ['./seasons-list.component.scss'],
  standalone: false,
  animations: [
    trigger('slideToggle', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-in-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class SeasonsListComponent implements OnInit, OnDestroy {
  
  yearGroups: YearGroup[] = [];
  filteredYearGroups: YearGroup[] = [];
  isLoading = false;
  selectedYear: number = new Date().getFullYear();
  
  filterForm: FormGroup;
  showFilters = false;
  
  SeasonType = SeasonType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private seasonService: SeasonService,
    private tourOperatorRouteService: TourOperatorRouteService,
    private dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.filterForm = this.fb.group({
      year: [null],
      type: [null],
      isActive: [null]
    });
  }

  ngOnInit(): void {
    this.setupFilterSubscription();
    this.loadSeasons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSeasons(): void {
    this.isLoading = true;
    
    const formValue = this.filterForm.value;
    const filter: SeasonFilterDto = {
      year: formValue.year || undefined,
      type: formValue.type || undefined,
      isActive: formValue.isActive ?? undefined,
      page: 1,
      pageSize: 1000
    };
    
    console.log('Loading seasons with filter:', filter);
    
    this.seasonService.getSeasons(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Seasons loaded:', result.items);
          this.groupSeasonsByYear(result.items);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private groupSeasonsByYear(seasons: SeasonDto[]): void {
    const groups: { [year: number]: SeasonDto[] } = {};
    
    seasons.forEach(season => {
      const year = new Date(season.startDate).getFullYear();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(season);
    });

    this.yearGroups = Object.keys(groups)
      .map(year => ({
        year: parseInt(year),
        seasons: groups[parseInt(year)].sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      }))
      .sort((a, b) => b.year - a.year);
      
    this.filteredYearGroups = this.yearGroups;
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadSeasons();
      });
  }


  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClearFilters(): void {
    this.filterForm.reset();
  }

  onNewSeason(): void {
    const dialogData = {
      year: this.selectedYear
    };

    const dialogRef = this.dialog.open(CreateSeasonsDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSeasons();
        this.errorHandlingService.showSuccessMessage(`Seasons created for year ${result.year}`);
      }
    });
  }

  onCreateSeasonsForYear(): void {
    const dialogData = {
      year: this.selectedYear
    };

    const dialogRef = this.dialog.open(CreateSeasonsDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSeasons();
        this.errorHandlingService.showSuccessMessage(`Seasons created for year ${result.year}`);
      }
    });
  }

  onToggleSeasonStatus(season: SeasonDto): void {
    if (this.isCurrentlyActive(season) && season.isActive) {
      this.errorHandlingService.showWarningMessage('Cannot deactivate currently active season');
      return;
    }

    const actionType = season.isActive ? 'deactivate' : 'activate';
    
    const dialogData: StatusToggleDialogData = {
      objectType: 'Season',
      objectName: season.name,
      currentStatus: season.isActive,
      actionType: actionType
    };

    const dialogRef = this.dialog.open(StatusToggleDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const updateDto = {
          ...season,
          isActive: !season.isActive
        };

        this.seasonService.updateSeason(updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadSeasons();
              this.errorHandlingService.showSuccessMessage(`Season ${actionType}d successfully`);
            },
            error: () => {
            }
          });
      }
    });
  }

  onViewAssignments(season: SeasonDto): void {
    const dialogRef = this.dialog.open(SeasonAssignmentsDialogComponent, {
      width: '700px',
      data: { season, assignments: [] }
    });

    this.tourOperatorRouteService.getBySeasonId(season.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignments) => {
          dialogRef.componentInstance.data.assignments = assignments;
          dialogRef.componentInstance.isLoading = false;
        },
        error: () => {
          this.errorHandlingService.showWarningMessage('Failed to load season assignments');
          dialogRef.close();
        }
      });
  }

  isCurrentlyActive(season: SeasonDto): boolean {
    const now = new Date();
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);
    return now >= startDate && now <= endDate;
  }

  canDeactivate(season: SeasonDto): boolean {
    return !this.isCurrentlyActive(season);
  }

  getSeasonTypeIcon(seasonType: SeasonType): string {
    switch (seasonType) {
      case SeasonType.Winter:
        return 'ac_unit';
      case SeasonType.Summer:
        return 'wb_sunny';
      default:
        return 'calendar_today';
    }
  }

  getSeasonTypeClass(seasonType: SeasonType): string {
    switch (seasonType) {
      case SeasonType.Winter:
        return 'season-type-winter';
      case SeasonType.Summer:
        return 'season-type-summer';
      default:
        return 'season-type-default';
    }
  }

  getStatusClass(season: SeasonDto): string {
    if (this.isCurrentlyActive(season)) {
      return 'status-current';
    }
    return season.isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(season: SeasonDto): string {
    if (this.isCurrentlyActive(season)) {
      return 'Current';
    }
    return season.isActive ? 'Active' : 'Inactive';
  }

  getUniformStatusClass(season: SeasonDto): string {
    if (this.isCurrentlyActive(season)) {
      return 'uniform-status-current';
    }
    return season.isActive ? 'uniform-status-active' : 'uniform-status-inactive';
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }

  getAvailableYears(): number[] {
    return this.yearGroups.map(g => g.year);
  }

  compareValues(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  yearExists(year: number): boolean {
    return this.yearGroups.some(group => group.year === year);
  }

}
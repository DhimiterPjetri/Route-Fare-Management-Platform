import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ErrorHandlingService } from '../../../../core/services/error-handling.service';

import { RouteService } from '../../../../core/services/route.service';
import { SeasonService } from '../../../../core/services/season.service';
import { TourOperatorService } from '../../../../core/services/tour-operator.service';
import { TourOperatorRouteService } from '../../../../core/services/tour-operator-route.service';
import { BookingClassService } from '../../../../core/services/booking-class.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RouteDto } from '../../../../core/models/route/route.model';
import { SeasonDto } from '../../../../core/models/season/season.model';
import { BookingClassDto } from '../../../../core/models/booking-class/booking-class.model';
import { AssignRoutesToSeasonDto, TourOperatorRouteDto } from '../../../../core/models/tour-operator/tour-operator-route.model';

@Component({
  selector: 'app-route-selection',
  templateUrl: './route-selection.component.html',
  styleUrls: ['./route-selection.component.scss'],
  standalone: false
})
export class RouteSelectionComponent implements OnInit, OnDestroy {

  selectionForm: FormGroup;
  isLoading = false;
  isAssigning = false;
  isLoadingCurrentRoutes = false;
  isLoadingBookingClasses = false;
  
  activeSeasons: SeasonDto[] = [];
  availableRoutes: RouteDto[] = [];
  filteredRoutes: RouteDto[] = [];
  selectedRoutes: RouteDto[] = [];
  currentAssignments: TourOperatorRouteDto[] = [];
  tourOperatorBookingClasses: BookingClassDto[] = [];
  
  selectedSeason: SeasonDto | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private routeService: RouteService,
    private seasonService: SeasonService,
    private tourOperatorService: TourOperatorService,
    private tourOperatorRouteService: TourOperatorRouteService,
    private bookingClassService: BookingClassService,
    private authService: AuthService,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.selectionForm = this.fb.group({
      seasonId: [null, Validators.required],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadActiveSeasons();
    this.loadTourOperatorBookingClasses();
    this.loadAvailableRoutes();
    this.loadCurrentAssignments();
    this.setupSearchFilter();
    this.setupSeasonChangeHandler();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActiveSeasons(): void {
    this.seasonService.getSeasons({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.activeSeasons = result.items || [];
        },
        error: (error) => {
        }
      });
  }

  private loadCurrentAssignments(): void {
    this.isLoadingCurrentRoutes = true;
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    
    if (!tourOperatorId) {
      this.isLoadingCurrentRoutes = false;
      return;
    }

    this.tourOperatorRouteService.getTourOperatorRoutes(tourOperatorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignments) => {
          this.currentAssignments = assignments;
          this.isLoadingCurrentRoutes = false;
        },
        error: (error) => {
          this.isLoadingCurrentRoutes = false;
        }
      });
  }

  private loadTourOperatorBookingClasses(): void {
    this.isLoadingBookingClasses = true;
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    
    if (!tourOperatorId) {
      this.isLoadingBookingClasses = false;
      this.errorHandlingService.showWarningMessage('Tour operator information not found');
      return;
    }

    this.bookingClassService.getTourOperatorBookingClasses(tourOperatorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookingClasses) => {
          this.tourOperatorBookingClasses = bookingClasses;
          this.isLoadingBookingClasses = false;
          
          this.applyFilter();
        },
        error: (error) => {
          this.errorHandlingService.showWarningMessage('Failed to load booking class configuration. Please configure your booking classes first.');
          this.isLoadingBookingClasses = false;
        }
      });
  }

  private setupSeasonChangeHandler(): void {
    this.selectionForm.get('seasonId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(seasonId => {
        this.selectedSeason = this.activeSeasons.find(s => s.id === seasonId) || null;
        this.selectedRoutes = [];
      });
  }

  loadAvailableRoutes(): void {
    this.isLoading = true;
    
    this.routeService.getAvailableRoutes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (routes) => {
          this.availableRoutes = routes;
          this.applyFilter();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private setupSearchFilter(): void {
    this.selectionForm.get('searchTerm')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilter();
      });
  }

  private applyFilter(): void {
    const searchTerm = this.selectionForm.get('searchTerm')?.value?.toLowerCase()?.trim() || '';
    
    let routesFilteredByBookingClasses = this.filterRoutesByBookingClasses();
    
    if (!searchTerm) {
      this.filteredRoutes = [...routesFilteredByBookingClasses];
    } else {
      this.filteredRoutes = routesFilteredByBookingClasses.filter(route =>
        route.routeCode?.toLowerCase().includes(searchTerm) ||
        route.origin?.toLowerCase().includes(searchTerm) ||
        route.destination?.toLowerCase().includes(searchTerm)
      );
    }
  }

  private filterRoutesByBookingClasses(): RouteDto[] {
    if (!this.tourOperatorBookingClasses || this.tourOperatorBookingClasses.length === 0) {
      return [];
    }
    
    const supportedBookingClassIds = this.tourOperatorBookingClasses.map(bc => bc.id);
    
    return this.availableRoutes.filter(route => {
      if (!route.availableBookingClasses || route.availableBookingClasses.length === 0) {
        return false;
      }
      
      return route.availableBookingClasses.some(routeBookingClass => 
        supportedBookingClassIds.includes(routeBookingClass.id)
      );
    });
  }

  onClearSearch(): void {
    this.selectionForm.patchValue({ searchTerm: '' });
    this.applyFilter();
  }

  onAddRoute(route: RouteDto): void {
    if (!this.selectedRoutes.find(r => r.id === route.id)) {
      this.selectedRoutes.push(route);
    }
  }

  onRemoveRoute(route: RouteDto): void {
    this.selectedRoutes = this.selectedRoutes.filter(r => r.id !== route.id);
  }

  isRouteSelected(route: RouteDto): boolean {
    return this.selectedRoutes.some(r => r.id === route.id);
  }

  isRouteAlreadyAssigned(route: RouteDto): boolean {
    if (!this.selectedSeason) return false;
    return this.currentAssignments.some(a => 
      a.routeId === route.id && a.seasonId === this.selectedSeason!.id
    );
  }

  onSaveAssignment(): void {
    if (!this.selectionForm.valid) {
      this.errorHandlingService.showWarningMessage('Please select a season');
      return;
    }

    if (this.selectedRoutes.length === 0) {
      this.errorHandlingService.showWarningMessage('Please select at least one route');
      return;
    }

    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId) {
      this.errorHandlingService.showWarningMessage('Tour operator information not found');
      return;
    }

    const assignment: AssignRoutesToSeasonDto = {
      tourOperatorId: tourOperatorId,
      seasonId: this.selectionForm.get('seasonId')?.value,
      routeIds: this.selectedRoutes.map(route => route.id)
    };

    this.isAssigning = true;

    this.tourOperatorService.assignRoutesToSeason(assignment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const routeCount = assignment.routeIds.length;
          
          this.errorHandlingService.showSuccessMessage(`Successfully assigned ${routeCount} route(s) to ${this.selectedSeason?.name}`);
          
          this.selectedRoutes = [];
          this.selectionForm.patchValue({ seasonId: null, searchTerm: '' });
          this.selectedSeason = null;
          
          this.loadAvailableRoutes();
          this.loadCurrentAssignments();
          
          this.isAssigning = false;
        },
        error: (error) => {
          this.isAssigning = false;
        }
      });
  }

  onClearSelection(): void {
    this.selectedRoutes = [];
  }

  getAssignmentsForSeason(seasonId: number): TourOperatorRouteDto[] {
    return this.currentAssignments.filter(a => a.seasonId === seasonId);
  }

  getSupportedBookingClassesForRoute(route: RouteDto | TourOperatorRouteDto): BookingClassDto[] {
    if (!route.availableBookingClasses || !this.tourOperatorBookingClasses) {
      return [];
    }
    
    const supportedBookingClassIds = this.tourOperatorBookingClasses.map(bc => bc.id);
    
    return route.availableBookingClasses.filter(routeBookingClass =>
      supportedBookingClassIds.includes(routeBookingClass.id)
    );
  }

}
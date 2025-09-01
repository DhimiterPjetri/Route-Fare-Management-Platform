import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { TourOperatorRouteService } from '../../../../core/services/tour-operator-route.service';
import { PricingService } from '../../../../core/services/pricing.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ExportService } from '../../../../core/services/export.service';
import { SignalRService } from '../../../../core/services/signalr.service';
import { BookingClassService } from '../../../../core/services/booking-class.service';
import { TourOperatorRouteDto } from '../../../../core/models/tour-operator/tour-operator-route.model';
import { ExportRequestDto, ExportProgressDto } from '../../../../core/models/export/export.model';
import { BulkPricingUpdateDto, BulkUpdateType, DayOfWeek } from '../../../../core/models/pricing/bulk-pricing.model';
import { PricingTableDto, PricingRowDto, ClassPricingDto } from '../../../../core/models/pricing/pricing-table.model';
import { BookingClassDto } from '../../../../core/models/booking-class/booking-class.model';
import { PricingDialogComponent, PricingDialogData } from './pricing-dialog/pricing-dialog.component';


@Component({
  selector: 'app-pricing-management',
  templateUrl: './pricing-management.component.html',
  styleUrls: ['./pricing-management.component.scss'],
  standalone: false
})
export class PricingManagementComponent implements OnInit, OnDestroy {

  selectionForm: FormGroup;
  isLoading = false;
  isSaving = false;
  isExporting = false;
  exportProgress: ExportProgressDto | null = null;
  
  tourOperatorRoutes: TourOperatorRouteDto[] = [];
  selectedRoute: TourOperatorRouteDto | null = null;
  
  pricingTableData: PricingTableDto | null = null;
  displayedColumns: string[] = [];
  hasUnsavedChanges = false;
  
  bulkForm: FormGroup;
  showBulkOperations = false;
  
  daysOfWeekOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  tourOperatorBookingClasses: BookingClassDto[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private tourOperatorRouteService: TourOperatorRouteService,
    private pricingService: PricingService,
    private authService: AuthService,
    private exportService: ExportService,
    private signalRService: SignalRService,
    private bookingClassService: BookingClassService,
    private dialog: MatDialog,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.selectionForm = this.fb.group({
      routeSeasonId: [null, Validators.required]
    });
    
    this.bulkForm = this.fb.group({
      operationType: ['AllDays', Validators.required],
      classId: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      seats: [null, [Validators.required, Validators.min(0)]],
      startDate: [null],
      endDate: [null],
      daysOfWeek: [[]]
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadTourOperatorRoutes();
    this.loadTourOperatorBookingClasses();
    this.setupFormSubscriptions();
    await this.initializeSignalR();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalRService.stopConnection();
  }

  loadTourOperatorRoutes(): void {
    this.isLoading = true;
    
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId) {
      this.errorHandlingService.showWarningMessage('Tour operator information not found');
      this.isLoading = false;
      return;
    }

    this.tourOperatorRouteService.getTourOperatorRoutes(tourOperatorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (routes) => {
          console.log('Received routes from API:', routes);
          
          this.tourOperatorRoutes = routes.filter(route => {
            const hasBookingClasses = route.availableBookingClasses && route.availableBookingClasses.length > 0;
            const isActive = route.isActive;
            
            if (route.seasonStartDate && route.seasonEndDate) {
              const seasonStart = new Date(route.seasonStartDate);
              const seasonEnd = new Date(route.seasonEndDate);
              const now = new Date();
              const isCurrentOrFutureSeason = seasonStart >= now || (seasonStart <= now && seasonEnd >= now);
              return hasBookingClasses && isActive && isCurrentOrFutureSeason;
            }
            
            return hasBookingClasses && isActive;
          });
          
          console.log('Filtered routes for pricing:', this.tourOperatorRoutes);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  loadTourOperatorBookingClasses(): void {
    const tourOperatorId = this.authService.getCurrentUser()?.tourOperatorId;
    if (!tourOperatorId) return;

    this.bookingClassService.getTourOperatorBookingClasses(tourOperatorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookingClasses) => {
          this.tourOperatorBookingClasses = bookingClasses;
          console.log('Tour operator booking classes:', this.tourOperatorBookingClasses);
        },
        error: (error) => {
          console.error('Failed to load tour operator booking classes:', error);
        }
      });
  }

  private setupFormSubscriptions(): void {
    this.selectionForm.get('routeSeasonId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(routeId => {
        if (routeId) {
          this.selectedRoute = this.tourOperatorRoutes.find(r => r.id === routeId) || null;
          this.loadPricingTable();
        } else {
          this.selectedRoute = null;
          this.pricingTableData = null;
        }
      });
  }

  private loadPricingTable(): void {
    if (!this.selectedRoute) return;
    
    console.log('Loading pricing table for route:', this.selectedRoute.id);
    this.isLoading = true;

    this.pricingService.getPricingTable(this.selectedRoute.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pricingTableDto: PricingTableDto) => {
          console.log('Pricing table loaded successfully:', pricingTableDto);
          this.pricingTableData = pricingTableDto;
          this.setupDisplayColumns();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading pricing table:', error);
          this.isLoading = false;
        }
      });
  }

  private setupDisplayColumns(): void {
    if (!this.selectedRoute) return;
    
    this.displayedColumns = ['date', 'dayOfWeek'];
    
    this.selectedRoute.availableBookingClasses.forEach(bookingClass => {
      this.displayedColumns.push(`class_${bookingClass.id}`);
    });
    
    this.displayedColumns.push('actions');
  }

  isWeekend(date: Date): boolean {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; 
  }

  getClassPricing(row: PricingRowDto, bookingClassId: number): ClassPricingDto | undefined {
    return row.classPricing.find(cp => cp.bookingClassId === bookingClassId);
  }

  onEditPricing(row: PricingRowDto): void {
    if (!this.selectedRoute) return;

    const dialogData: PricingDialogData = {
      pricingRow: row,
      availableBookingClasses: this.selectedRoute.availableBookingClasses,
      tourOperatorRouteId: this.selectedRoute.id
    };

    const dialogRef = this.dialog.open(PricingDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.errorHandlingService.showSuccessMessage('Pricing updated successfully');
        this.loadPricingTable(); 
      }
    });
  }

  isDaySelected(dayIndex: number): boolean {
    const selectedDays = this.bulkForm.get('daysOfWeek')?.value || [];
    return selectedDays.includes(dayIndex);
  }

  onDaySelectionChange(dayIndex: number, checked: boolean): void {
    const selectedDays = this.bulkForm.get('daysOfWeek')?.value || [];
    
    if (checked && !selectedDays.includes(dayIndex)) {
      selectedDays.push(dayIndex);
    } else if (!checked && selectedDays.includes(dayIndex)) {
      const index = selectedDays.indexOf(dayIndex);
      selectedDays.splice(index, 1);
    }
    
    this.bulkForm.get('daysOfWeek')?.setValue(selectedDays);
  }

  onSavePricing(): void {
    this.errorHandlingService.showSuccessMessage('Use bulk operations to update pricing data');
  }

  onDiscardChanges(): void {
    this.loadPricingTable();
    this.hasUnsavedChanges = false;
    this.errorHandlingService.showSuccessMessage('Changes discarded');
  }

  toggleBulkOperations(): void {
    this.showBulkOperations = !this.showBulkOperations;
  }

  onBulkApply(): void {
    if (!this.bulkForm.valid || !this.selectedRoute) {
      this.errorHandlingService.showWarningMessage('Please fill in all required fields for bulk operation');
      return;
    }
    
    const formValue = this.bulkForm.value;
    if (formValue.classId === null || formValue.price === null || formValue.seats === null) {
      this.errorHandlingService.showWarningMessage('Please fill in booking class, price, and seats for bulk operation');
      return;
    }

    const classPrices: { [bookingClassId: number]: number } = {};
    const classSeats: { [bookingClassId: number]: number } = {};
    
    classPrices[formValue.classId] = formValue.price;
    classSeats[formValue.classId] = formValue.seats;

    const bulkUpdate: BulkPricingUpdateDto = {
      tourOperatorRouteId: this.selectedRoute.id,
      updateType: this.getBulkUpdateType(formValue.operationType),
      classPrices: classPrices,
      classSeats: classSeats
    };

    if (formValue.operationType === 'SpecificDaysOfWeek' && formValue.daysOfWeek?.length > 0) {
      bulkUpdate.daysOfWeek = formValue.daysOfWeek;
    } else if (formValue.operationType === 'DateRange') {
      bulkUpdate.startDate = formValue.startDate;
      bulkUpdate.endDate = formValue.endDate;
    }
    
    this.pricingService.bulkUpdatePricing(bulkUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: string) => {
          console.log('Bulk update response:', response);
          this.errorHandlingService.showSuccessMessage(response || 'Bulk operation applied successfully');
          this.hasUnsavedChanges = false;
          this.loadPricingTable(); 
          this.bulkForm.patchValue({
            operationType: 'AllDays',
            classId: null,
            price: null,
            seats: null,
            startDate: null,
            endDate: null,
            daysOfWeek: []
          });
        },
        error: () => {
        }
      });
  }

  private async initializeSignalR(): Promise<void> {
    try {
      console.log('Initializing SignalR connection for pricing management...');
      await this.signalRService.startConnection();
      console.log('SignalR connection established:', this.signalRService.isConnected());
      
      this.signalRService.exportProgress$
        .pipe(takeUntil(this.destroy$))
        .subscribe((progress: ExportProgressDto | null) => {
          console.log('Progress update received in pricing management:', progress);
          this.exportProgress = progress;
          
          if (progress && (progress.isComplete || progress.progress >= 100)) {
            this.handleExportComplete();
          }
        });

      this.signalRService.connectionState$
        .pipe(takeUntil(this.destroy$))
        .subscribe(state => {
          console.log('SignalR connection state:', state);
        });
    } catch (error) {
      console.error('Failed to initialize SignalR connection:', error);
      this.errorHandlingService.showWarningMessage('Failed to establish real-time connection. Export progress may not be visible.');
    }
  }

  private handleExportComplete(): void {
    this.isExporting = false;
    this.exportProgress = null;
    this.signalRService.clearProgress();
    
    this.errorHandlingService.showSuccessMessage('Export completed successfully. File download should start automatically.');
  }

  onExportPricing(): void {
    if (!this.selectedRoute) return;
    
    if (!this.signalRService.isConnected()) {
      this.errorHandlingService.showWarningMessage('SignalR connection not established. Please refresh the page and try again.');
      return;
    }

    this.isExporting = true;
    this.exportProgress = { 
      jobId: '',
      progress: 0, 
      message: 'Initializing pricing export...', 
      isComplete: false,
      hasError: false,
      timestamp: new Date() 
    };
    
    const exportRequest: ExportRequestDto = {
      tourOperatorId: this.selectedRoute.tourOperatorId,
      seasonId: this.selectedRoute.seasonId,
      routeId: this.selectedRoute.routeId,
      includeSummary: true,
      includeDetails: true
    };

    this.exportService.exportToExcel(exportRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `pricing-${this.selectedRoute!.routeCode}-${timestamp}.xlsx`;
            this.exportService.downloadFile(blob, filename);
          }
        },
        error: () => {
          this.isExporting = false;
          this.exportProgress = null;
        }
      });
  }

  private getBulkUpdateType(operationType: string): BulkUpdateType {
    switch (operationType) {
      case 'AllDays':
        return BulkUpdateType.AllDays;
      case 'SpecificDaysOfWeek':
        return BulkUpdateType.SpecificDaysOfWeek;
      case 'DateRange':
        return BulkUpdateType.DateRange;
      default:
        return BulkUpdateType.AllDays;
    }
  }

  isBulkFormValid(): boolean {
    const formValue = this.bulkForm.value;
    
    if (!formValue.operationType || !formValue.classId || formValue.price === null || formValue.seats === null) {
      return false;
    }
    
    if (formValue.operationType === 'SpecificDaysOfWeek') {
      return formValue.daysOfWeek && formValue.daysOfWeek.length > 0;
    } else if (formValue.operationType === 'DateRange') {
      return formValue.startDate && formValue.endDate;
    }
    
    return true;
  }

  getRouteDisplayName(route: TourOperatorRouteDto): string {
    return `${route.routeCode} - ${route.seasonName} (${route.origin} → ${route.destination})`;
  }

}
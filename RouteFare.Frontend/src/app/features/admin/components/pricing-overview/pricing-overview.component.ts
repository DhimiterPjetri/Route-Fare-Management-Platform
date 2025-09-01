import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, startWith, debounceTime } from 'rxjs/operators';
import { ErrorHandlingService } from '../../../../core/services/error-handling.service';
import { PricingService } from '../../../../core/services/pricing.service';
import { TourOperatorService } from '../../../../core/services/tour-operator.service';
import { SeasonService } from '../../../../core/services/season.service';
import { RouteService } from '../../../../core/services/route.service';
import { ExportService } from '../../../../core/services/export.service';
import { SignalRService } from '../../../../core/services/signalr.service';
import { PricingDto, PricingFilterDto } from '../../../../core/models/pricing/pricing.model';
import { TourOperatorDto } from '../../../../core/models/tour-operator/tour-operator.model';
import { SeasonDto } from '../../../../core/models/season/season.model';
import { RouteDto } from '../../../../core/models/route/route.model';
import { PagedResult } from '../../../../core/models/common/api.model';
import { ExportRequestDto, ExportProgressDto } from '../../../../core/models/export/export.model';

@Component({
  selector: 'app-pricing-overview',
  templateUrl: './pricing-overview.component.html',
  styleUrls: ['./pricing-overview.component.scss'],
  standalone: false
})
export class PricingOverviewComponent implements OnInit, OnDestroy {
  
  displayedColumns: string[] = ['operator', 'route', 'season', 'bookingClass', 'date', 'dayOfWeek', 'price', 'requestedSeats'];
  pricingData: PricingDto[] = [];
  totalCount = 0;
  isLoading = false;
  isExporting = false;
  exportProgress: ExportProgressDto | null = null;
  error: string | null = null;

  filterForm: FormGroup;
  exportForm: FormGroup;
  showFilters = false;
  tourOperators: TourOperatorDto[] = [];
  seasons: SeasonDto[] = [];
  routes: RouteDto[] = [];

  currentPage = 1;
  pageSize = 10;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private pricingService: PricingService,
    private tourOperatorService: TourOperatorService,
    private seasonService: SeasonService,
    private routeService: RouteService,
    private exportService: ExportService,
    private signalRService: SignalRService,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.filterForm = this.fb.group({
      tourOperatorId: [null],
      seasonId: [null],
      routeId: [null],
      startDate: [null],
      endDate: [null]
    });

    this.exportForm = this.fb.group({
      exportType: [['summary', 'detailed']]
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadFilterData();
    this.setupFilterSubscription();
    this.loadPricingData();
    await this.initializeSignalR();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalRService.stopConnection();
  }

  private async initializeSignalR(): Promise<void> {
    try {
      console.log('Initializing SignalR connection...');
      await this.signalRService.startConnection();
      console.log('SignalR connection established:', this.signalRService.isConnected());
      
      this.signalRService.exportProgress$
        .pipe(takeUntil(this.destroy$))
        .subscribe((progress: ExportProgressDto | null) => {
          console.log('Progress update received in component:', progress);
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

  private loadFilterData(): void {
    forkJoin({
      operators: this.tourOperatorService.getTourOperators({ 
        isActive: true, 
        page: 1, 
        pageSize: 1000 
      }),
      seasons: this.seasonService.getSeasons({ page: 1, pageSize: 1000 }),
      routes: this.routeService.getRoutes({ 
        isActive: true, 
        page: 1, 
        pageSize: 1000 
      })
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.tourOperators = data.operators.items || [];
        this.seasons = data.seasons.items || [];
        this.routes = data.routes.items || [];
      },
      error: () => {
      }
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPricingData();
      });
  }

  loadPricingData(): void {
    this.isLoading = true;
    this.error = null;
    
    const formValue = this.filterForm.value;
    const filter: PricingFilterDto = {
      tourOperatorId: formValue.tourOperatorId || undefined,
      seasonId: formValue.seasonId || undefined,
      routeId: formValue.routeId || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };
    
    this.pricingService.getPricing(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<PricingDto>) => {
          this.pricingData = result.items;
          this.totalCount = result.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPricingData();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onClearFilters(): void {
    this.filterForm.reset();
  }

  onExportData(): void {
    if (!this.signalRService.isConnected()) {
      this.errorHandlingService.showWarningMessage('SignalR connection not established. Please refresh the page and try again.');
      return;
    }

    this.isExporting = true;
    this.exportProgress = { 
      jobId: '',
      progress: 0, 
      message: 'Initializing export...', 
      isComplete: false,
      hasError: false,
      timestamp: new Date() 
    };
    
    const formValue = this.filterForm.value;
    const exportTypes = this.exportForm.get('exportType')?.value || [];
    
    const exportRequest: ExportRequestDto = {
      tourOperatorId: formValue.tourOperatorId || undefined,
      seasonId: formValue.seasonId || undefined,
      routeId: formValue.routeId || undefined,
      includeSummary: exportTypes.includes('summary'),
      includeDetails: exportTypes.includes('detailed')
    };

    this.exportService.exportToExcel(exportRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `pricing-overview-${timestamp}.xlsx`;
            this.exportService.downloadFile(blob, filename);
            this.isExporting = false;
          }
        },
        error: () => {
          this.isExporting = false;
          this.exportProgress = null;
        }
      });
  }

  getTourOperatorName(operatorId: number): string {
    const operator = this.tourOperators.find(op => op.id === operatorId);
    return operator?.name || 'Unknown Operator';
  }

  getSeasonName(seasonId: number): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season?.name || 'Unknown Season';
  }

  getRouteName(routeId: number): string {
    const route = this.routes.find(r => r.id === routeId);
    return route?.routeCode || 'Unknown Route';
  }

  getCompletenessPercentage(pricing: PricingDto): number {
    return pricing.price && pricing.price > 0 ? 100 : 0;
  }

  getCompletenessClass(percentage: number): string {
    if (percentage === 100) return 'completeness-full';
    if (percentage >= 75) return 'completeness-high';
    if (percentage >= 50) return 'completeness-medium';
    return 'completeness-low';
  }

  formatPrice(price: number | null | undefined): string {
    if (!price || price === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  }

}
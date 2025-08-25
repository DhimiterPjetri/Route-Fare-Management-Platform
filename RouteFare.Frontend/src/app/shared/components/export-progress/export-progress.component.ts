import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../core/store/app.state';
import * as ExportSelectors from '../../../core/store/export/export.selectors';
import * as ExportActions from '../../../core/store/export/export.actions';
import { ExportProgressDto } from '../../../core/models/export/export.model';

@Component({
  selector: 'app-export-progress',
  templateUrl: './export-progress.component.html',
  styleUrls: ['./export-progress.component.scss'],
  standalone: false
})
export class ExportProgressComponent implements OnInit, OnDestroy {
  
  isVisible$: Observable<boolean>;
  isExporting$: Observable<boolean>;
  progress$: Observable<ExportProgressDto | null>;
  error$: Observable<string | null>;
  progressPercentage$: Observable<number>;
  progressMessage$: Observable<string>;

  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>) {
    this.isVisible$ = this.store.select(ExportSelectors.selectIsExportDialogVisible);
    this.isExporting$ = this.store.select(ExportSelectors.selectIsExporting);
    this.progress$ = this.store.select(ExportSelectors.selectExportProgress);
    this.error$ = this.store.select(ExportSelectors.selectExportError);
    this.progressPercentage$ = this.store.select(ExportSelectors.selectExportProgressPercentage);
    this.progressMessage$ = this.store.select(ExportSelectors.selectExportProgressMessage);
  }

  ngOnInit(): void {
    this.store.select(ExportSelectors.selectIsExporting)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isExporting => {
        if (!isExporting) {
          setTimeout(() => {
            this.onClose();
          }, 2000);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.store.dispatch(ExportActions.hideExportDialog());
  }

  onCancel(): void {
    this.store.dispatch(ExportActions.cancelExport());
  }

  onRetry(): void {
    this.store.dispatch(ExportActions.resetProgress());
    this.store.dispatch(ExportActions.hideExportDialog());
  }
}
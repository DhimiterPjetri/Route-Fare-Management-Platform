import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExportState } from './export.state';

export const selectExportState = (state: AppState) => state.export;

export const selectIsExporting = createSelector(
  selectExportState,
  (state: ExportState) => state.isExporting
);

export const selectIsExportDialogVisible = createSelector(
  selectExportState,
  (state: ExportState) => state.isDialogVisible
);

export const selectExportProgress = createSelector(
  selectExportState,
  (state: ExportState) => state.progress
);

export const selectExportError = createSelector(
  selectExportState,
  (state: ExportState) => state.error
);

export const selectExportId = createSelector(
  selectExportState,
  (state: ExportState) => state.exportId
);

export const selectLastExportedFile = createSelector(
  selectExportState,
  (state: ExportState) => state.lastExportedFile
);

export const selectExportProgressPercentage = createSelector(
  selectExportProgress,
  (progress) => progress ? progress.progress : 0
);

export const selectExportProgressMessage = createSelector(
  selectExportProgress,
  (progress) => progress ? progress.message : ''
);
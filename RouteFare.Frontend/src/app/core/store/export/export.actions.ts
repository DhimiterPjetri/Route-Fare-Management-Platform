import { createAction, props } from '@ngrx/store';
import { ExportRequestDto, ExportProgressDto } from '../../models/export/export.model';

export const startExport = createAction(
  '[Export] Start Export',
  props<{ request: ExportRequestDto }>()
);

export const startExportSuccess = createAction(
  '[Export] Start Export Success',
  props<{ exportId: string }>()
);

export const startExportFailure = createAction(
  '[Export] Start Export Failure',
  props<{ error: string }>()
);

export const updateProgress = createAction(
  '[Export] Update Progress',
  props<{ progress: ExportProgressDto }>()
);

export const resetProgress = createAction(
  '[Export] Reset Progress'
);

export const downloadComplete = createAction(
  '[Export] Download Complete',
  props<{ filename: string }>()
);

export const exportComplete = createAction(
  '[Export] Export Complete'
);

export const exportError = createAction(
  '[Export] Export Error',
  props<{ error: string }>()
);

export const showExportDialog = createAction(
  '[Export] Show Export Dialog'
);

export const hideExportDialog = createAction(
  '[Export] Hide Export Dialog'
);

export const cancelExport = createAction(
  '[Export] Cancel Export'
);
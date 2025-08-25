import { createReducer, on } from '@ngrx/store';
import { ExportState, initialExportState } from './export.state';
import * as ExportActions from './export.actions';

export const exportReducer = createReducer(
  initialExportState,
  
  on(ExportActions.startExport, (state): ExportState => ({
    ...state,
    isExporting: true,
    isDialogVisible: true,
    progress: null,
    error: null,
    exportId: null
  })),

  on(ExportActions.startExportSuccess, (state, { exportId }): ExportState => ({
    ...state,
    exportId,
    error: null
  })),

  on(ExportActions.startExportFailure, (state, { error }): ExportState => ({
    ...state,
    isExporting: false,
    error,
    exportId: null
  })),

  on(ExportActions.updateProgress, (state, { progress }): ExportState => ({
    ...state,
    progress
  })),

  on(ExportActions.resetProgress, (state): ExportState => ({
    ...state,
    progress: null
  })),

  on(ExportActions.downloadComplete, (state, { filename }): ExportState => ({
    ...state,
    lastExportedFile: filename
  })),

  on(ExportActions.exportComplete, (state): ExportState => ({
    ...state,
    isExporting: false,
    isDialogVisible: false,
    progress: null,
    exportId: null,
    error: null
  })),

  on(ExportActions.exportError, (state, { error }): ExportState => ({
    ...state,
    isExporting: false,
    error,
    exportId: null
  })),

  on(ExportActions.showExportDialog, (state): ExportState => ({
    ...state,
    isDialogVisible: true
  })),

  on(ExportActions.hideExportDialog, (state): ExportState => ({
    ...state,
    isDialogVisible: false
  })),

  on(ExportActions.cancelExport, (state): ExportState => ({
    ...state,
    isExporting: false,
    isDialogVisible: false,
    progress: null,
    exportId: null,
    error: null
  }))
);
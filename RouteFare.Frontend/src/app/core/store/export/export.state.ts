import { ExportProgressDto } from '../../models/export/export.model';

export interface ExportState {
  isExporting: boolean;
  isDialogVisible: boolean;
  progress: ExportProgressDto | null;
  exportId: string | null;
  error: string | null;
  lastExportedFile: string | null;
}

export const initialExportState: ExportState = {
  isExporting: false,
  isDialogVisible: false,
  progress: null,
  exportId: null,
  error: null,
  lastExportedFile: null
};
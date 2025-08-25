export interface ExportRequestDto {
  tourOperatorId?: number;
  routeId?: number;
  seasonId?: number;
  includeSummary: boolean;
  includeDetails: boolean;
}

export interface ExportProgressDto {
  jobId: string;
  progress: number;
  message: string;
  downloadUrl?: string;
  isComplete: boolean;
  hasError: boolean;
  timestamp: Date;
}
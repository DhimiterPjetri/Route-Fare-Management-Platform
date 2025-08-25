import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ExportRequestDto } from '../models/export/export.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private apiService: ApiService) {}

  exportToExcel(request: ExportRequestDto): Observable<Blob> {
    return this.apiService.downloadFile('Export/excel', request);
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
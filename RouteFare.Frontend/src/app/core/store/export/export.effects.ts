import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { ExportService } from '../../services/export.service';
import * as ExportActions from './export.actions';

@Injectable()
export class ExportEffects {

  startExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExportActions.startExport),
      exhaustMap(action =>
        this.exportService.exportToExcel(action.request).pipe(
          map(blob => {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `route-fare-export-${timestamp}.xlsx`;
            
            this.exportService.downloadFile(blob, filename);
            
            return ExportActions.downloadComplete({ filename });
          }),
          catchError(error => of(ExportActions.exportError({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  downloadComplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExportActions.downloadComplete),
      map(() => ExportActions.exportComplete())
    )
  );

  constructor(
    private actions$: Actions,
    private exportService: ExportService
  ) {}
}
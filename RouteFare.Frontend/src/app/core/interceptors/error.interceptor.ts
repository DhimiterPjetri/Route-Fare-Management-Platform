import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ErrorHandlingService } from '../services/error-handling.service';
import { AppError } from '../models/common/error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlingService = inject(ErrorHandlingService);

  return next(req).pipe(
    retry({
      count: 1,
      delay: (error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0 || error.status >= 500) {
            return throwError(() => error);
          }
        }
        throw error;
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const appError = AppError.fromHttpError(error);
      
      errorHandlingService.handleError(appError);

      return throwError(() => appError);
    })
  );
};
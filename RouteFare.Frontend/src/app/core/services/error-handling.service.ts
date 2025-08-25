import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppError, ErrorType } from '../models/common/error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorSubject = new BehaviorSubject<AppError | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  handleError(error: AppError): void {
    this.errorSubject.next(error);
    
    console.error('Application Error:', {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      details: error.details
    });

    switch (error.type) {
      case ErrorType.AuthenticationError:
        this.handleAuthenticationError(error);
        break;
      case ErrorType.AuthorizationError:
        this.handleAuthorizationError(error);
        break;
      case ErrorType.ValidationError:
        this.handleValidationError(error);
        break;
      case ErrorType.NotFound:
        this.handleNotFoundError(error);
        break;
      case ErrorType.BusinessError:
        this.handleBusinessError(error);
        break;
      case ErrorType.NetworkError:
        this.handleNetworkError(error);
        break;
      default:
        this.handleUnknownError(error);
    }
  }

  private handleAuthenticationError(error: AppError): void {
    this.showErrorMessage('Your session has expired. Please login again.');
    
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    this.router.navigate(['/auth/login']);
  }

  private handleAuthorizationError(error: AppError): void {
    this.showErrorMessage('You are not authorized to perform this action.');
  }

  private handleValidationError(error: AppError): void {
    if (error.details?.validationErrors && Array.isArray(error.details.validationErrors)) {
      const validationMessages = error.details.validationErrors
        .map((ve: any) => ve.message)
        .join(', ');
      this.showErrorMessage(`Validation Error: ${validationMessages}`);
    } else {
      this.showErrorMessage(error.message || 'Please check your input and try again.');
    }
  }

  private handleNotFoundError(error: AppError): void {
    this.showErrorMessage(error.message || 'The requested resource was not found.');
  }

  private handleBusinessError(error: AppError): void {
    this.showErrorMessage(error.message || 'A business rule was violated.');
  }

  private handleNetworkError(error: AppError): void {
    this.showErrorMessage('Network connection error. Please check your internet connection and try again.');
  }

  private handleUnknownError(error: AppError): void {
    this.showErrorMessage('An unexpected error occurred. Please try again later.');
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  getCurrentError(): AppError | null {
    return this.errorSubject.value;
  }
}
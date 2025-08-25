export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  validationErrors?: ValidationError[];
  details?: any;
}

export enum ErrorType {
  ValidationError = 'ValidationError',
  AuthenticationError = 'AuthenticationError',
  AuthorizationError = 'AuthorizationError',
  NotFound = 'NotFound',
  BusinessError = 'BusinessError',
  NetworkError = 'NetworkError',
  UnknownError = 'UnknownError'
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UnknownError,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromHttpError(error: any): AppError {
    const statusCode = error.status || 500;
    const message = error.error?.message || error.message || 'An unexpected error occurred';
    
    let errorType: ErrorType;
    
    switch (statusCode) {
      case 400:
        errorType = error.error?.validationErrors ? ErrorType.ValidationError : ErrorType.BusinessError;
        break;
      case 401:
        errorType = ErrorType.AuthenticationError;
        break;
      case 403:
        errorType = ErrorType.AuthorizationError;
        break;
      case 404:
        errorType = ErrorType.NotFound;
        break;
      case 0:
        errorType = ErrorType.NetworkError;
        break;
      default:
        errorType = ErrorType.UnknownError;
    }

    return new AppError(message, errorType, statusCode, error.error);
  }
}
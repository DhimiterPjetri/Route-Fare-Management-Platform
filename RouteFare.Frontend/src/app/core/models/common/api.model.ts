export interface ApiResponse<T> {
  data?: T;
  isSuccess: boolean;
  error?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface Result<T> {
  data?: T;
  isSuccess: boolean;
  error?: string;
}
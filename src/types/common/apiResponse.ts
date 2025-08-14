export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  statusCode: number = 200
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  statusCode,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  error: string,
  statusCode: number,
  details?: any
): ApiResponse => ({
  success: false,
  error,
  statusCode,
  timestamp: new Date().toISOString(),
  ...(details && { details }),
});

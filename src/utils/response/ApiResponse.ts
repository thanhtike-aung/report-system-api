interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export class ApiResponse {
  static success<T>(data: T, meta?: IApiResponse<T>['meta']): IApiResponse<T> {
    return {
      success: true,
      data,
      ...(meta && { meta })
    };
  }

  static error(message: string, code?: string, details?: unknown): IApiResponse<never> {
    return {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details })
      }
    };
  }
}
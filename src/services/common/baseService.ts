import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { NotFoundError, ValidationError } from "../../utils/errors";
import { logger } from "../../utils/logger";

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a success response
   */
  protected createSuccessResponse<T>(data: T, message?: string): ServiceResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Create an error response
   */
  protected createErrorResponse(error: string): ServiceResponse {
    return {
      success: false,
      error,
    };
  }

  /**
   * Get date range for today
   */
  protected getTodayRange(): DateRange {
    const startDate = dayjs().startOf('day').toDate();
    const endDate = dayjs().endOf('day').toDate();
    return { startDate, endDate };
  }

  /**
   * Get date range for a specific date
   */
  protected getDateRange(date: string | Date): DateRange {
    const targetDate = dayjs(date);
    const startDate = targetDate.startOf('day').toDate();
    const endDate = targetDate.endOf('day').toDate();
    return { startDate, endDate };
  }

  /**
   * Get date range for a period (e.g., last 7 days)
   */
  protected getPeriodRange(days: number): DateRange {
    const endDate = dayjs().toDate();
    const startDate = dayjs().subtract(days, 'day').toDate();
    return { startDate, endDate };
  }

  /**
   * Validate that a record exists
   */
  protected async validateExists<T>(
    findOperation: () => Promise<T | null>,
    resourceName: string,
    id?: number | string
  ): Promise<T> {
    const record = await findOperation();
    if (!record) {
      const identifier = id ? ` with ID ${id}` : '';
      throw new NotFoundError(`${resourceName}${identifier} not found`);
    }
    return record;
  }

  /**
   * Validate array of IDs
   */
  protected validateIds(ids: any[], fieldName: string = 'IDs'): number[] {
    if (!Array.isArray(ids)) {
      throw new ValidationError(`${fieldName} must be an array`);
    }

    const numericIds = ids.map((id, index) => {
      const numId = Number(id);
      if (isNaN(numId) || numId <= 0) {
        throw new ValidationError(`Invalid ID at index ${index}: ${id}. All IDs must be positive numbers`);
      }
      return numId;
    });

    if (numericIds.length === 0) {
      throw new ValidationError(`${fieldName} array cannot be empty`);
    }

    return numericIds;
  }

  /**
   * Validate single ID
   */
  protected validateId(id: any, fieldName: string = 'ID'): number {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      throw new ValidationError(`Invalid ${fieldName}: ${id}. Must be a positive number`);
    }
    return numId;
  }

  /**
   * Execute database operations with transaction support and error logging
   */
  protected async executeWithTransaction<T>(
    operation: (tx: any) => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      logger.debug(`Starting database operation: ${operationName}`);
      
      const result = await this.prisma.$transaction(async (tx) => {
        return await operation(tx);
      });

      logger.debug(`Database operation completed: ${operationName}`);
      return result;
    } catch (error) {
      logger.error(`Database operation failed: ${operationName}`, error as Error);
      throw error;
    }
  }

  /**
   * Execute simple database operations with error logging
   */
  protected async execute<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      logger.debug(`Starting database operation: ${operationName}`);
      const result = await operation();
      logger.debug(`Database operation completed: ${operationName}`);
      return result;
    } catch (error) {
      logger.error(`Database operation failed: ${operationName}`, error as Error);
      throw error;
    }
  }

  /**
   * Build pagination query options
   */
  protected buildPaginationOptions(options: PaginationOptions = {}) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = options;
    
    const skip = (page - 1) * limit;
    const take = limit;
    
    const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;
    
    return {
      skip,
      take,
      orderBy,
    };
  }

  /**
   * Common include patterns for related data
   */
  protected getStandardIncludes() {
    return {
      withUser: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      withProject: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      withUserAndProject: {
        user: {
          include: {
            project: true,
          },
        },
      },
    };
  }

  /**
   * Helper to exclude sensitive fields like passwords
   */
  protected excludeSensitiveFields<T extends Record<string, any>>(
    obj: T,
    excludeFields: string[] = ['password']
  ): Omit<T, keyof typeof excludeFields> {
    const result = { ...obj };
    excludeFields.forEach(field => {
      delete result[field];
    });
    return result;
  }
}

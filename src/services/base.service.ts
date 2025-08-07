import { PrismaClient } from '@prisma/client';
import { QueryOptions } from '../types/common';
import { NotFoundError } from '../utils/errors/AppError';

export abstract class BaseService {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string) {
    this.prisma = new PrismaClient();
    this.modelName = modelName;
  }

  protected async findById<T>(id: number): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaClient] as any;
    const item = await model.findUnique({
      where: { id }
    });

    if (!item) {
      throw new NotFoundError(`${this.modelName} with id ${id} not found`);
    }

    return item as T;
  }

  protected async findMany<T>(options?: QueryOptions): Promise<{ data: T[]; total?: number }> {
    const model = this.prisma[this.modelName as keyof PrismaClient] as any;
    const where = options?.filter || {};
    
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip: options?.pagination ? (options.pagination.page - 1) * options.pagination.limit : undefined,
        take: options?.pagination?.limit,
        orderBy: options?.sort 
          ? { [options.sort.field]: options.sort.order }
          : undefined
      }),
      options?.pagination ? model.count({ where }) : undefined
    ]);

    return {
      data,
      ...(total !== undefined && { total })
    };
  }

  protected async create<T>(data: any): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaClient] as any;
    return model.create({ data }) as T;
  }

  protected async update<T>(id: number, data: any): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaClient] as any;
    return model.update({
      where: { id },
      data
    }) as T;
  }

  protected async delete(id: number): Promise<void> {
    const model = this.prisma[this.modelName as keyof PrismaClient] as any;
    await model.delete({
      where: { id }
    });
  }
}
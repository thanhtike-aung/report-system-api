import { Request, Response } from 'express';
import { ApiResponse } from '../utils/response/ApiResponse';
import { QueryOptions } from '../types/common';

export abstract class BaseController {
  protected abstract service: any;

  protected async handleGetAll(req: Request, res: Response) {
    const options: QueryOptions = {
      pagination: req.query.page && req.query.limit
        ? {
            page: parseInt(req.query.page as string),
            limit: parseInt(req.query.limit as string)
          }
        : undefined,
      sort: req.query.sortBy && req.query.sortOrder
        ? {
            field: req.query.sortBy as string,
            order: req.query.sortOrder as 'asc' | 'desc'
          }
        : undefined,
      filter: req.query.filter ? JSON.parse(req.query.filter as string) : undefined
    };

    const { data, total } = await this.service.findMany(options);
    
    return res.json(
      ApiResponse.success(data, options.pagination ? { ...options.pagination, total } : undefined)
    );
  }

  protected async handleGetById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await this.service.findById(parseInt(id));
    return res.json(ApiResponse.success(data));
  }

  protected async handleCreate(req: Request, res: Response) {
    const data = await this.service.create(req.body);
    return res.status(201).json(ApiResponse.success(data));
  }

  protected async handleUpdate(req: Request, res: Response) {
    const { id } = req.params;
    const data = await this.service.update(parseInt(id), req.body);
    return res.json(ApiResponse.success(data));
  }

  protected async handleDelete(req: Request, res: Response) {
    const { id } = req.params;
    await this.service.delete(parseInt(id));
    return res.status(204).send();
  }
}
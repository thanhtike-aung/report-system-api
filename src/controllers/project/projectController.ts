import { Request, Response } from 'express';
import { BaseController } from '../base.controller';
import { ProjectService } from '../../services/project/projectService';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponse } from '../../utils/response/ApiResponse';

export class ProjectController extends BaseController {
  protected service: ProjectService;

  constructor() {
    super();
    this.service = new ProjectService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const projects = await this.service.findAll();
    return res.json(ApiResponse.success(projects));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    return this.handleGetById(req, res);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    return this.handleCreate(req, res);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    return this.handleUpdate(req, res);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    return this.handleDelete(req, res);
  });
}

// Create controller instance
const projectController = new ProjectController();

// Export controller methods
export const {
  getAll: getProject,
  getById: getProjectById,
  create: createProject,
  update: updateProject,
  delete: deleteProject
} = projectController;
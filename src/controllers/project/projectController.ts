import { Request, Response, NextFunction } from "express";
import { BaseController } from "../common/baseController";
import { validateInput } from "../../utils/validation";
import {
  create as createProjectService,
  destroy as deleteProjectService,
  getById as getProjectByIdService,
  get as getProjectService,
  update as updateProjectService,
} from "../../services/project/projectService";
import { STATUS_CODES } from "../../constants/messages";

class ProjectController extends BaseController {
  /**
   * Get all projects
   */
  public getProjects = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getProjectService();
      },
      "Projects retrieved successfully",
    );
  };

  /**
   * Get project by ID
   */
  public getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const id = this.getIdFromParams(req);
        return await getProjectByIdService(id);
      },
      "Project retrieved successfully",
    );
  };

  /**
   * Create new project
   */
  public createProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        validateInput(req.body, [
          { field: "name", required: true, type: "string", minLength: 1 },
        ]);

        return await createProjectService(req.body);
      },
      "Project created successfully",
      STATUS_CODES.CREATED,
    );
  };

  /**
   * Update project
   */
  public updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const id = this.getIdFromParams(req);
        this.validateRequestBody(req);

        validateInput(req.body, [
          { field: "name", required: false, type: "string", minLength: 1 },
        ]);

        return await updateProjectService(id, req.body);
      },
      "Project updated successfully",
    );
  };

  /**
   * Delete project
   */
  public deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleNoContentRequest(req, res, next, async () => {
      const id = this.getIdFromParams(req);
      return await deleteProjectService(id);
    });
  };
}

const projectController = new ProjectController();

// Export individual methods for route handlers
export const getProject = projectController.getProjects;
export const getProjectById = projectController.getProjectById;
export const createProject = projectController.createProject;
export const updateProject = projectController.updateProject;
export const deleteProject = projectController.deleteProject;

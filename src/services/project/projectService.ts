import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { Project } from "../../types/project";
import { BaseService } from "../common/baseService";
import { logger } from "../../utils/logger";

interface CreateProjectPayload {
  name: string;
  color: string;
}

interface UpdateProjectPayload {
  name?: string;
  color?: string;
}

class ProjectService extends BaseService {
  constructor() {
    super(prisma);
  }

  /**
   * Get all projects with users
   */
  async getAllProjects(): Promise<Project[]> {
    return this.execute(async () => {
      return await this.prisma.project.findMany({
        include: { users: true },
      });
    }, "getAllProjects");
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: number): Promise<Project> {
    return this.execute(async () => {
      const projectId = this.validateId(id, "Project ID");

      return await this.validateExists(
        () =>
          this.prisma.project.findUnique({
            where: { id: projectId },
            include: { users: true },
          }),
        "Project",
        projectId,
      );
    }, "getProjectById");
  }

  /**
   * Create new project
   */
  async createProject(projectData: CreateProjectPayload): Promise<Project> {
    return this.execute(async () => {
      logger.info("Creating new project", { name: projectData.name });

      const newProject = await this.prisma.project.create({
        data: {
          name: projectData.name,
          color: projectData.color,
        },
        include: { users: true },
      });

      logger.info("Project created successfully", {
        projectId: newProject.id,
        name: newProject.name,
      });

      return newProject;
    }, "createProject");
  }

  /**
   * Update project
   */
  async updateProject(
    id: number,
    projectData: UpdateProjectPayload,
  ): Promise<Project> {
    return this.execute(async () => {
      const projectId = this.validateId(id, "Project ID");

      // Verify project exists
      await this.validateExists(
        () => this.prisma.project.findUnique({ where: { id: projectId } }),
        "Project",
        projectId,
      );

      logger.info("Updating project", {
        projectId,
        changes: Object.keys(projectData),
      });

      const updateData: any = {
        updated_at: new Date(),
      };

      if (projectData.name !== undefined) updateData.name = projectData.name;

      const updatedProject = await this.prisma.project.update({
        where: { id: projectId },
        data: updateData,
        include: { users: true },
      });

      logger.info("Project updated successfully", { projectId });

      return updatedProject;
    }, "updateProject");
  }

  /**
   * Delete project
   */
  async deleteProject(id: number): Promise<boolean> {
    return this.execute(async () => {
      const projectId = this.validateId(id, "Project ID");

      // Verify project exists
      await this.validateExists(
        () => this.prisma.project.findUnique({ where: { id: projectId } }),
        "Project",
        projectId,
      );

      // Check if project has users
      const projectWithUsers = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { users: true },
      });

      if (projectWithUsers?.users && projectWithUsers.users.length > 0) {
        throw new Error(
          "Cannot delete project with existing users. Please reassign users first.",
        );
      }

      logger.info("Deleting project", { projectId });

      await this.prisma.project.delete({
        where: { id: projectId },
      });

      logger.info("Project deleted successfully", { projectId });

      return true;
    }, "deleteProject");
  }
}

const projectService = new ProjectService();

// Legacy exports for backward compatibility
export const get = () => projectService.getAllProjects();
export const getById = (id: number) => projectService.getProjectById(id);
export const create = (project: CreateProjectPayload) =>
  projectService.createProject(project);
export const update = (id: number, project: UpdateProjectPayload) =>
  projectService.updateProject(id, project);
export const destroy = (id: number) => projectService.deleteProject(id);

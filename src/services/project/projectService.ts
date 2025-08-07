import { BaseService } from '../base.service';
import { Project } from '../../types/models';
import { CreateProjectRequest, UpdateProjectRequest } from '../../types/requests';
import { NotFoundError } from '../../utils/errors/AppError';

export class ProjectService extends BaseService {
  constructor() {
    super('project');
  }

  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      include: {
        users: true
      }
    });
  }

  async findById(id: number): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!project) {
      throw new NotFoundError(`Project with id ${id} not found`);
    }

    return project;
  }

  async create(data: CreateProjectRequest): Promise<Project> {
    return this.prisma.project.create({
      data: {
        name: data.name,
        color: data.color || '#5b87ff'
      },
      include: {
        users: true
      }
    });
  }

  async update(id: number, data: UpdateProjectRequest): Promise<Project> {
    // Check if project exists
    await this.findById(id);

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        users: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    // Check if project exists
    await this.findById(id);

    await this.prisma.project.delete({
      where: { id }
    });
  }
}
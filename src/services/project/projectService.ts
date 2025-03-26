import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { Project } from "../../types/project";

/**
 *
 * @returns
 */
export const get = async (): Promise<Project[]> => {
  return await prisma.project.findMany({
    include: { users: true },
  });
};

/**
 *
 * @param id
 * @returns
 */
export const getById = async (id: number): Promise<Project | null> => {
  return await prisma.project.findFirst({
    where: { id },
  });
};

/**
 *
 * @param project
 * @returns
 */
export const create = async (
  project: Prisma.ProjectCreateInput,
): Promise<Project> => {
  return await prisma.project.create({
    data: project,
  });
};

/**
 * update project
 * @param project
 * @returns
 */
export const update = async (
  id: number,
  project: { name: string },
): Promise<Project> => {
  return await prisma.project.update({
    where: { id },
    data: {
      name: project.name,
      updated_at: new Date().toISOString(),
    },
  });
};

/**
 *
 * @param id
 * @returns
 */
export const destroy = async (id: number): Promise<Project> => {
  return await prisma.project.delete({
    where: { id },
  });
};

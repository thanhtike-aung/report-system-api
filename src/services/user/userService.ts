import { User, UserPayload } from "types/user";
import prisma from "../../lib/prisma";
import { hash } from "bcryptjs";
import { ROOT_ADMIN_ID } from "../../constants/common";

/**
 * get all users
 * @returns
 */
export const get = async (): Promise<User[]> => {
  return await prisma.user.findMany({
    where: {
      NOT: { id: ROOT_ADMIN_ID },
    },
    include: { project: true, supervisor: true },
  });
};

/**
 * get user by id
 * @returns
 */
export const getById = async (id: number): Promise<User | null> => {
  return await prisma.user.findFirst({
    where: { id: id },
    include: { project: true, supervisor: true },
  });
};

/**
 * create member
 * @param user
 * @returns
 */
export const create = async (user: UserPayload): Promise<User> => {
  return prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: await hash(user.password, 10),
      project_id: Number(user.projectId),
      role: user.role,
      is_active: user.isActive,
      workflows_url: user.workflowsUrl,
      supervisor_id:
        user.supervisorId && user.supervisorId !== "0"
          ? Number(user.supervisorId)
          : null,
    },
  });
};

/**
 * update member
 * @param id
 * @param user
 * @returns
 */
export const update = async (id: number, user: UserPayload): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: {
      name: user.name,
      email: user.email,
      project_id: Number(user.projectId),
      role: user.role,
      is_active: user.isActive,
      workflows_url: user.workflowsUrl,
      supervisor_id:
        user.supervisorId && user.supervisorId !== "0"
          ? Number(user.supervisorId)
          : null,
    },
  });
};

/**
 * mark user as inactive
 * @param id
 * @returns
 */
export const deactivate = async (id: number): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: {
      is_active: false,
    },
  });
};

/**
 * delete user
 * @param id
 * @returns
 */
export const destroy = async (id: number): Promise<User> => {
  return prisma.user.delete({
    where: { id },
  });
};

/**
 * get user list except given id
 * @param id
 * @returns
 */
export const getWithoutId = async (id: number): Promise<User[]> => {
  return prisma.user.findMany({
    where: {
      NOT: {
        id: { in: [ROOT_ADMIN_ID, id] },
      },
    },
    include: { project: true },
  });
};

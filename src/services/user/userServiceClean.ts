import {
  User,
  UserPayload,
  UserRole,
  CreateUserPayload,
  UpdateUserPayload,
} from "types/user";
import prisma from "../../lib/prisma";
import { hash } from "bcryptjs";
import { ROOT_ADMIN_ID } from "../../constants/common";
import { BaseService } from "../common/baseService";
import { logger } from "../../utils/logger";
import { NotFoundError } from "../../utils/errors";
import dayjs from "dayjs";

class UserService extends BaseService {
  constructor() {
    super(prisma);
  }

  /**
   * Get all users (excluding root admin)
   */
  async getAllUsers(): Promise<User[]> {
    return this.execute(async () => {
      return await this.prisma.user.findMany({
        where: {
          NOT: { id: ROOT_ADMIN_ID },
        },
        include: { project: true, supervisor: true },
      });
    }, "getAllUsers");
  }

  /**
   * Get all active users
   */
  async getActiveUsers(): Promise<User[]> {
    return this.execute(async () => {
      return await this.prisma.user.findMany({
        where: {
          NOT: { id: ROOT_ADMIN_ID },
          is_active: true,
        },
        include: { project: true, supervisor: true },
      });
    }, "getActiveUsers");
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    return this.execute(async () => {
      const userId = this.validateId(id, "User ID");

      return await this.validateExists(
        () =>
          this.prisma.user.findUnique({
            where: { id: userId },
            include: { project: true, supervisor: true },
          }),
        "User",
        userId,
      );
    }, "getUserById");
  }

  /**
   * Get users by multiple IDs with reports
   */
  async getUsersByIdsWithReport(ids: number[]): Promise<User[]> {
    return this.execute(async () => {
      const validIds = this.validateIds(ids, "User IDs");

      return await this.prisma.user.findMany({
        where: {
          id: { in: validIds },
        },
        include: { reports: true },
      });
    }, "getUsersByIdsWithReport");
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserPayload): Promise<User> {
    return this.execute(async () => {
      logger.info("Creating new user", {
        email: userData.email,
        role: userData.role,
      });

      const hashedPassword = await hash(userData.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          project_id: userData.projectId,
          role: userData.role,
          is_active: userData.isActive ?? true,
          can_report: userData.canReport ?? true,
          workflows_url: userData.workflowsUrl || null,
          supervisor_id: userData.supervisorId || null,
        },
        include: { project: true, supervisor: true },
      });

      logger.info("User created successfully", {
        userId: newUser.id,
        email: newUser.email,
      });

      // Return user without password
      return this.excludeSensitiveFields(newUser) as User;
    }, "createUser");
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: UpdateUserPayload): Promise<User> {
    return this.execute(async () => {
      const userId = this.validateId(id, "User ID");

      // Verify user exists
      await this.validateExists(
        () => this.prisma.user.findUnique({ where: { id: userId } }),
        "User",
        userId,
      );

      logger.info("Updating user", { userId, changes: Object.keys(userData) });

      const updateData: any = {};

      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.isActive !== undefined)
        updateData.is_active = userData.isActive;
      if (userData.canReport !== undefined)
        updateData.can_report = userData.canReport;
      if (userData.workflowsUrl !== undefined)
        updateData.workflows_url = userData.workflowsUrl || null;
      if (userData.supervisorId !== undefined)
        updateData.supervisor_id = userData.supervisorId;
      if (userData.projectId !== undefined)
        updateData.project_id = userData.projectId;

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { project: true, supervisor: true },
      });

      logger.info("User updated successfully", { userId });

      return this.excludeSensitiveFields(updatedUser) as User;
    }, "updateUser");
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(id: number): Promise<User> {
    return this.execute(async () => {
      const userId = this.validateId(id, "User ID");

      logger.info("Deactivating user", { userId });

      const deactivatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { is_active: false },
        include: { project: true, supervisor: true },
      });

      logger.info("User deactivated successfully", { userId });

      return this.excludeSensitiveFields(deactivatedUser) as User;
    }, "deactivateUser");
  }

  /**
   * Delete user permanently
   */
  async deleteUser(id: number): Promise<boolean> {
    return this.execute(async () => {
      const userId = this.validateId(id, "User ID");

      // Verify user exists
      await this.validateExists(
        () => this.prisma.user.findUnique({ where: { id: userId } }),
        "User",
        userId,
      );

      logger.info("Permanently deleting user", { userId });

      await this.prisma.user.delete({
        where: { id: userId },
      });

      logger.info("User deleted successfully", { userId });

      return true;
    }, "deleteUser");
  }

  /**
   * Get users except specified ID
   */
  async getUsersExceptId(excludeId: number): Promise<User[]> {
    return this.execute(async () => {
      const userId = this.validateId(excludeId, "Exclude User ID");

      return await this.prisma.user.findMany({
        where: {
          id: { not: userId },
          NOT: { id: ROOT_ADMIN_ID },
        },
        include: { project: true, supervisor: true },
      });
    }, "getUsersExceptId");
  }
}

const userService = new UserService();

// Legacy exports for backward compatibility
export const get = () => userService.getAllUsers();
export const getActiveUsers = () => userService.getActiveUsers();
export const getById = (id: number) => userService.getUserById(id);
export const getByIdsWithReport = (ids: number[]) =>
  userService.getUsersByIdsWithReport(ids);
export const create = (userData: CreateUserPayload) =>
  userService.createUser(userData);
export const update = (id: number, userData: UpdateUserPayload) =>
  userService.updateUser(id, userData);
export const deactivate = (id: number) => userService.deactivateUser(id);
export const destroy = (id: number) => userService.deleteUser(id);
export const getWithoutId = (id: number) => userService.getUsersExceptId(id);

// Additional helper methods
export const getWithSubordinates = async (): Promise<User[]> => {
  return await prisma.user.findMany({
    where: {
      NOT: { id: ROOT_ADMIN_ID },
      subordinates: {
        some: {},
      },
    },
    include: { project: true, supervisor: true, subordinates: true },
  });
};

export const getByRole = async (role: UserRole): Promise<User | null> => {
  return await prisma.user.findFirst({
    where: { role },
  });
};

export const getAuthorizedReportersWithUsersAndReports = async (): Promise<
  User[]
> => {
  return await prisma.user.findMany({
    where: {
      can_report: true,
      workflows_url: {
        not: null,
      },
    },
    include: {
      reports: true,
      project: true,
      subordinates: {
        include: {
          reports: true,
          project: true,
        },
      },
    },
  });
};

export const getAuthorizedReportersWithOneWeekReports = async (): Promise<
  User[]
> => {
  const oneWeekAgo = dayjs().subtract(9, "day").toDate();
  return await prisma.user.findMany({
    where: {
      can_report: true,
      workflows_url: {
        not: null,
      },
    },
    include: {
      reports: {
        where: {
          updated_at: {
            gte: oneWeekAgo,
          },
        },
      },
      subordinates: {
        include: {
          reports: {
            where: {
              updated_at: {
                gte: oneWeekAgo,
              },
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
};

import { Request, Response, NextFunction } from "express";
import { BaseController } from "../common/baseController";
import { validateInput, validateIds, validateId } from "../../utils/validation";
import { CreateUserPayload, UpdateUserPayload } from "../../types/user";
import {
  create as createUserService,
  get as getUserService,
  getById as getUserByIdService,
  update as updateUserService,
  destroy as destroyUserService,
  getWithoutId as getUserWithoutIdService,
  deactivate as deactivateUserService,
  getByIdsWithReport as getUsersByIdsWithReportService,
  getAuthorizedReportersWithUsersAndReports as getAuthorizedReportersWithUsersAndReportsService,
  getAuthorizedReportersWithOneWeekReports as getAuthorizedReportersWithOneWeekReportsService,
} from "../../services/user/userService";
import { sendAccountEmail } from "../../utils/mailer";
import { logger } from "../../utils/logger";
import { STATUS_CODES } from "../../constants/messages";

class UserController extends BaseController {
  /**
   * Get all users
   */
  public getUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getUserService();
      },
      "Users retrieved successfully",
    );
  };

  /**
   * Get user by ID
   */
  public getUserById = async (
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
        return await getUserByIdService(id);
      },
      "User retrieved successfully",
    );
  };

  /**
   * Get users by IDs with reports
   */
  public getUsersByIdsWithReport = async (
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
          { field: "ids", required: true, type: "array" },
        ]);

        const ids = validateIds(req.body.ids);
        return await getUsersByIdsWithReportService(ids);
      },
      "Users with reports retrieved successfully",
    );
  };

  /**
   * Get authorized reporters with users and reports
   */
  public getAuthorizedReportersWithUsersAndReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getAuthorizedReportersWithUsersAndReportsService();
      },
      "Authorized reporters retrieved successfully",
    );
  };

  /**
   * Get authorized reporters with one week reports
   */
  public getAuthorizedReportersWithOneWeekReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getAuthorizedReportersWithOneWeekReportsService();
      },
      "Weekly reports retrieved successfully",
    );
  };

  /**
   * Create new user
   */
  public createUser = async (
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
          { field: "email", required: true, type: "email" },
          { field: "password", required: true, type: "string", minLength: 6 },
          { field: "projectId", required: true },
          { field: "role", required: true, type: "string" },
        ]);

        const { email, password } = req.body;
        const createUserPayload: CreateUserPayload = {
          ...req.body,
          projectId: Number(req.body.projectId),
        };

        const user = await createUserService(createUserPayload);

        // Send email asynchronously without blocking the response
        sendAccountEmail(email, password).catch((error) =>
          logger.error("Email sending failed", error, { email }),
        );

        return user;
      },
      "User created successfully",
      STATUS_CODES.CREATED,
    );
  };

  /**
   * Update user
   */
  public updateUser = async (
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

        const updateUserPayload: UpdateUserPayload = req.body;
        return await updateUserService(id, updateUserPayload);
      },
      "User updated successfully",
    );
  };

  /**
   * Deactivate user
   */
  public deactivateUser = async (
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
        return await deactivateUserService(id);
      },
      "User deactivated successfully",
    );
  };

  /**
   * Delete user
   */
  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleNoContentRequest(req, res, next, async () => {
      const id = this.getIdFromParams(req);
      return await destroyUserService(id);
    });
  };

  /**
   * Get users except specified ID
   */
  public getUsersExceptId = async (
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
        return await getUserWithoutIdService(id);
      },
      "Users retrieved successfully",
    );
  };
}

const userController = new UserController();

// Export individual methods for route handlers
export const getUser = userController.getUser;
export const getUserById = userController.getUserById;
export const getUsersByIdsWithReport = userController.getUsersByIdsWithReport;
export const getAuthorizedReportersWithUsersAndReports =
  userController.getAuthorizedReportersWithUsersAndReports;
export const getAuthorizedReportersWithOneWeekReports =
  userController.getAuthorizedReportersWithOneWeekReports;
export const createUser = userController.createUser;
export const updateUser = userController.updateUser;
export const deactivateUser = userController.deactivateUser;
export const deleteUser = userController.deleteUser;
export const getUsersExceptId = userController.getUsersExceptId;

// Legacy export for backward compatibility
export const deactiveUser = userController.deactivateUser;

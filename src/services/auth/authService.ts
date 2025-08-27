import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import prisma from "../../lib/prisma";
import { LoginPayload, ChangePasswordPayload } from "../../types/auth";
import {
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from "../../utils/errors";
import { BaseService, ServiceResponse } from "../common/baseService";
import { config } from "../../utils/config";
import { logger } from "../../utils/logger";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService extends BaseService {
  constructor() {
    super(prisma);
  }

  /**
   * User login
   */
  async login(loginPayload: LoginPayload) {
    return this.execute(async () => {
      logger.info("User login attempt", { email: loginPayload.email });

      const user = await this.prisma.user.findUnique({
        where: { email: loginPayload.email },
        include: { project: true, supervisor: true },
      });

      if (!user) {
        logger.warn("Login failed: User not found", {
          email: loginPayload.email,
        });
        return {
          status: STATUS_CODES.UNAUTHORIZED,
          message: MESSAGE.ERROR.EMAIL_NOT_FOUND,
        };
      }

      const isMatch = await bcrypt.compare(
        loginPayload.password,
        user.password,
      );
      if (!isMatch) {
        logger.warn("Login failed: Invalid password", {
          email: loginPayload.email,
        });
        return {
          status: STATUS_CODES.UNAUTHORIZED,
          message: MESSAGE.ERROR.WRONG_PASSWORD,
        };
      }

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          project: user.project.name,
          projectId: user.project_id,
          supervisorRole: user.supervisor?.role,
        },
        config.JWT_SECRET,
        { expiresIn: "6d" },
      );

      logger.info("User login successful", {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        status: STATUS_CODES.OK,
        message: MESSAGE.SUCCESS.LOGGED_IN,
        token: token,
      };
    }, "login");
  }

  /**
   * Change user password
   */
  async changePassword(passwordPayload: ChangePasswordPayload) {
    return this.execute(async () => {
      const userId = this.validateId(passwordPayload.userId, "User ID");

      logger.info("Password change attempt", { userId });

      const user = await this.validateExists(
        () => this.prisma.user.findUnique({ where: { id: userId } }),
        "User",
        userId,
      );

      const isOldPasswordCorrect = await bcrypt.compare(
        passwordPayload.oldPassword,
        user.password,
      );

      if (!isOldPasswordCorrect) {
        logger.warn("Password change failed: Invalid current password", {
          userId,
        });
        return {
          status: STATUS_CODES.UNAUTHORIZED,
          message: "Your current password is wrong.",
        };
      }

      const hashedNewPassword = await hash(passwordPayload.newPassword, 10);

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updated_at: true,
        },
      });

      logger.info("Password change successful", { userId });

      return {
        status: STATUS_CODES.OK,
        data: updatedUser,
        message: "Password changed successfully",
      };
    }, "changePassword");
  }
}

const authService = new AuthService();

// Export methods for backward compatibility
export const login = (payload: LoginPayload) => authService.login(payload);
export const changePassword = (payload: ChangePasswordPayload) =>
  authService.changePassword(payload);

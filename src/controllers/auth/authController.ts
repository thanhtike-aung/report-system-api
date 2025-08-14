import { Request, Response, NextFunction } from "express";
import { BaseController } from "../common/baseController";
import { validateInput } from "../../utils/validation";
import { LoginPayload, ChangePasswordPayload } from "../../types/auth";
import {
  changePassword as changePasswordService,
  login as loginService,
} from "../../services/auth/authService";

class AuthController extends BaseController {
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        // Validate input
        validateInput(req.body, [
          { field: "email", required: true, type: "email" },
          { field: "password", required: true, type: "string", minLength: 1 },
        ]);

        const loginPayload: LoginPayload = req.body;
        return await loginService(loginPayload);
      },
      "Login successful",
    );
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        // Validate input
        validateInput(req.body, [
          { field: "userId", required: true, type: "number" },
          {
            field: "oldPassword",
            required: true,
            type: "string",
            minLength: 1,
          },
          {
            field: "newPassword",
            required: true,
            type: "string",
            minLength: 6,
          },
        ]);

        const changePasswordPayload: ChangePasswordPayload = req.body;
        return await changePasswordService(changePasswordPayload);
      },
      "Password changed successfully",
    );
  };
}

const authController = new AuthController();

// Export individual methods for route handlers
export const login = authController.login;
export const changePassword = authController.changePassword;

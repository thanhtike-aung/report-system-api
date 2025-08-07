import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/authService';
import { ApiResponse } from '../../utils/response/ApiResponse';
import { asyncHandler } from '../../middleware/asyncHandler';
// import { validateZod } from '../../middleware/validateZod';
// import { loginSchema, changePasswordSchema } from '../../validations/schemas';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await this.authService.login(req.body);
    return res.json(ApiResponse.success({ user, token }));
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    const { oldPassword, newPassword } = req.body;
    await this.authService.changePassword(userId, oldPassword, newPassword);
    return res.json(ApiResponse.success({ message: 'Password changed successfully' }));
  });
}

// Create controller instance
const authController = new AuthController();

// Export controller methods
export const { login, changePassword } = authController;
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";
import { MESSAGE } from "../constants/messages";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  project: string;
  projectId: number;
  supervisorRole?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    throw new UnauthorizedError(MESSAGE.ERROR.ACCESS_DENIED);
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    ) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError(MESSAGE.ERROR.INVALID_TOKEN);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    throw error;
  }
};

export default authMiddleware;

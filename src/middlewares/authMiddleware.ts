import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header("Authorization");

  if (!token) {
    res.status(401).json({ message: "Access denied, no token provided" });
    return;
  }

  try {
    jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET as string);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

export default authMiddleware;

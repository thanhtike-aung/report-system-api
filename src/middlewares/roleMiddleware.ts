import { NextFunction, Request, Response } from "express";

const roleMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const role = req.header("Role");

  if (!role) {
    res
      .status(401)
      .json({ error: "Access denied, role must be supported in request!" });
    return;
  }

  try {
  } catch (error) {
    console.error(error);
  }
};

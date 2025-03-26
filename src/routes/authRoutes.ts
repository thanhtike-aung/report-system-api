import { changePassword, login } from "../controllers/auth/authController";
import { Router } from "express";

export const setAuthRoutes = (app: Router) => {
  app.post("/login", login);
  app.patch("/changePassword", changePassword);
};

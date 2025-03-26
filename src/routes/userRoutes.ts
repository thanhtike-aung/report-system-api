import {
  createUser,
  deleteUser,
  getUser,
  getUserById,
  getUsersExceptId,
  updateUser,
} from "../controllers/user/userController";
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

export const setUserRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/users", getUser);
  app.get("/users/:id", getUserById);
  app.post("/users", createUser);
  app.patch("/users/:id", updateUser);
  app.delete("/users/:id", deleteUser);
  app.get("/users/not/:id", getUsersExceptId);
};

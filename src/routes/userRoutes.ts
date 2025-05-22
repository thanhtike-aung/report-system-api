import {
  createUser,
  deactiveUser,
  deleteUser,
  getAuthorizedReportersWithOneWeekReports,
  getAuthorizedReportersWithUsersAndReports,
  getUser,
  getUserById,
  getUsersByIdsWithReport,
  getUsersExceptId,
  updateUser,
} from "../controllers/user/userController";
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

export const setUserRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/users", getUser);
  app.get("/users/:id", getUserById);
  app.get(
    "/users/authorized/reporters",
    getAuthorizedReportersWithUsersAndReports,
  );
  app.get(
    "/users/authorized/reporters/week",
    getAuthorizedReportersWithOneWeekReports,
  );
  app.post("/users/report", getUsersByIdsWithReport);
  app.post("/users", createUser);
  app.patch("/users/:id", updateUser);
  app.delete("/users/:id", deleteUser);
  app.get("/users/not/:id", getUsersExceptId);
  app.patch("/users/:id/deactivate", deactiveUser);
};

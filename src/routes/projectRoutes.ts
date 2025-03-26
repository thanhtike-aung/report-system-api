import {
  createProject,
  deleteProject,
  getProject,
  getProjectById,
  updateProject,
} from "../controllers/project/projectController";
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

export const setProjectRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/projects", getProject);
  app.get("/projects/:id", getProjectById);
  app.post("/projects", createProject);
  app.patch("/projects/:id", updateProject);
  app.delete("/projects/:id", deleteProject);
};

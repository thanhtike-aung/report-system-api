import {
  createReports,
  getReports,
  updateReports,
} from "../controllers/report/reportController";
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

export const setReportRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/reports", getReports);
  app.post("/reports", createReports);
  app.patch("/reports/:id", updateReports);
};

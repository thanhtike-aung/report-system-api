import authMiddleware from "../middlewares/authMiddleware";
import {
  createReport,
  getReportByDate,
  getReports,
} from "../controllers/report/reportController";
import { Router } from "express";

export const setReportRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/reports", getReports);
  app.post("/reports", createReport);
  app.get("/reports/today", getReportByDate);
};

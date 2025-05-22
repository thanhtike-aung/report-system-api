import {
  createReports,
  getOneWeekAgoReports,
  getReports,
  getReportsByIdAndWeekAgo,
  getReportsByUserIds,
  updateReports,
} from "../controllers/report/reportController";
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";

export const setReportRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/reports", getReports);
  app.get("/reports/weekago", getOneWeekAgoReports);
  app.get("/reports/weekago/:id", getReportsByIdAndWeekAgo);
  app.post("/reports/user/ids", getReportsByUserIds);
  app.post("/reports", createReports);
  app.patch("/reports/:id", updateReports);
};

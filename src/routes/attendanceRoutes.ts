import {
  createAttendance,
  getAttendanceByDate,
  getAttendances,
  sendAttendanceToTeams,
} from "../controllers/attendance/attendanceController";
import authMiddleware from "../middlewares/authMiddleware";
import { Router } from "express";

export const setAttendanceRoutes = (app: Router) => {
  app.use(authMiddleware);

  app.get("/attendances", getAttendances);
  app.post("/attendances", createAttendance);
  app.get("/attendnaces/today", getAttendanceByDate);
  app.post("/attendance", sendAttendanceToTeams);
};

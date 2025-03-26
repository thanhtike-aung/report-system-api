import { sendAttendanceToTeams } from "../controllers/attendance/attendanceController";
import { Router } from "express";

export const setAttendanceRoutes = (app: Router) => {
  app.post("/attendance", sendAttendanceToTeams);
};

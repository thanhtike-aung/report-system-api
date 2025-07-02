import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { setAuthRoutes } from "./routes/authRoutes";
import { setUserRoutes } from "./routes/userRoutes";
import { setProjectRoutes } from "./routes/projectRoutes";
import { setAttendanceRoutes } from "./routes/attendanceRoutes";
import { sendAttendanceToTeams } from "./controllers/attendance/attendanceController";
import { setReportRoutes } from "./routes/reportRoutes";
import {
  sendReportReminderToTeams,
  sendReportToTeams,
} from "./controllers/report/reportController";
import { setAdaptiveCardMessageRoutes } from "./routes/adaptiveCardMessageRoutes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// cron: send morning attendance message to microsoft teams (08:30 am)
cron.schedule(
  "30 08 * * 1-5",
  () => {
    sendAttendanceToTeams();
  },
  {
    timezone: "Asia/Yangon",
  },
);

// cron: send evening reporting reminder message to microsoft teams (04:30 pm)
cron.schedule(
  "30 16 * * 1-5",
  () => {
    sendReportReminderToTeams();
  },
  {
    timezone: "Asia/Yangon",
  },
);

// cron: send evening reporting message to microsoft teams (06:30 pm)
cron.schedule(
  "30 18 * * 1-5",
  () => {
    sendReportToTeams();
  },
  {
    timezone: "Asia/Yangon",
  },
);

// routing
setAuthRoutes(app);
setUserRoutes(app);
setAttendanceRoutes(app);
setReportRoutes(app);
setProjectRoutes(app);
setAdaptiveCardMessageRoutes(app);

app.listen(process.env.NODE_PORT, () => {
  console.info(`server is running on ${process.env.NODE_PORT}`);
});

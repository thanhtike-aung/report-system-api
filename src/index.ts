import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { setAuthRoutes } from "./routes/authRoutes";
import { setReportRoutes } from "./routes/reportRoutes";
import { setUserRoutes } from "./routes/userRoutes";
import { setProjectRoutes } from "./routes/projectRoutes";
import { setAttendanceRoutes } from "./routes/attendanceRoutes";
import { sendAttendanceToTeams } from "./controllers/attendance/attendanceController";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// cron job (scheduled at 08:30)
cron.schedule(
  "35 14 * * *",
  () => {
    sendAttendanceToTeams();
  },
  {
    timezone: "Asia/Yangon",
  },
);

// routing
setAuthRoutes(app);
setUserRoutes(app);
setReportRoutes(app);
setProjectRoutes(app);
setAttendanceRoutes(app);

app.listen(process.env.NODE_PORT, () => {
  console.info(`server is running on ${process.env.NODE_PORT}`);
});

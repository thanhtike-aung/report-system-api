import { cronScheduler } from "../cronScheduler";
import { sendAttendanceToTeams } from "../../../controllers/attendance/attendanceController";
import { logger } from "../../../utils/logger";

/**
 * Setup attendance-related cron jobs
 */
export const setupAttendanceJobs = (): void => {
  // Morning attendance message job
  cronScheduler.registerJob(
    "MORNING_ATTENDANCE",
    async () => {
      logger.info("Executing morning attendance job");
      await sendAttendanceToTeams();
      logger.info("Morning attendance message sent successfully");
    }
  );

  logger.info("Attendance cron jobs registered");
};

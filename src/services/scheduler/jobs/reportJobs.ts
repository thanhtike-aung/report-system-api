import { cronScheduler } from "../cronScheduler";
import { 
  sendReportReminderToTeams, 
  sendReportToTeams 
} from "../../../controllers/report/reportController";
import { logger } from "../../../utils/logger";

/**
 * Setup report-related cron jobs
 */
export const setupReportJobs = (): void => {
  // Evening report reminder job
  cronScheduler.registerJob(
    "EVENING_REPORT_REMINDER",
    async () => {
      logger.info("Executing evening report reminder job");
      await sendReportReminderToTeams();
      logger.info("Evening report reminder sent successfully");
    }
  );

  // Evening report job
  cronScheduler.registerJob(
    "EVENING_REPORT",
    async () => {
      logger.info("Executing evening report job");
      await sendReportToTeams();
      logger.info("Evening report sent successfully");
    }
  );

  logger.info("Report cron jobs registered");
};

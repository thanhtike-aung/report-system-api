import { cronScheduler } from "../cronScheduler";
import { setupAttendanceJobs } from "./attendanceJobs";
import { setupReportJobs } from "./reportJobs";
import { logger } from "../../../utils/logger";

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = (): void => {
  try {
    logger.info("Initializing cron jobs...");

    // Register attendance-related jobs
    setupAttendanceJobs();

    // Register report-related jobs
    setupReportJobs();

    // Start all registered jobs
    cronScheduler.startAll();

    logger.info("All cron jobs initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize cron jobs", error as Error);
    throw error;
  }
};

/**
 * Gracefully shutdown all cron jobs
 */
export const shutdownCronJobs = async (): Promise<void> => {
  try {
    await cronScheduler.shutdown();
  } catch (error) {
    logger.error("Error during cron jobs shutdown", error as Error);
    throw error;
  }
};

/**
 * Get status of all cron jobs
 */
export const getCronJobsStatus = () => {
  return cronScheduler.getJobsStatus();
};

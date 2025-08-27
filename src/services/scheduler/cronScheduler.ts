import cron from "node-cron";
import { logger } from "../../utils/logger";
import { CRON_SCHEDULES, getCronSchedule } from "../../config/cronConfig";

export interface CronJob {
  name: string;
  task: cron.ScheduledTask;
  isRunning: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  errorCount: number;
}

export class CronScheduler {
  private jobs: Map<string, CronJob> = new Map();
  private isInitialized: boolean = false;

  /**
   * Register a cron job
   */
  registerJob(
    jobName: string,
    handler: () => Promise<void>,
    customConfig?: Partial<typeof CRON_SCHEDULES.MORNING_ATTENDANCE>,
  ): void {
    const config = customConfig
      ? {
          ...getCronSchedule(jobName as keyof typeof CRON_SCHEDULES),
          ...customConfig,
        }
      : getCronSchedule(jobName as keyof typeof CRON_SCHEDULES);

    if (!config.enabled) {
      logger.info(`Cron job ${jobName} is disabled, skipping registration`);
      return;
    }

    if (this.jobs.has(jobName)) {
      logger.warn(`Cron job ${jobName} already exists, skipping registration`);
      return;
    }

    const wrappedHandler = async () => {
      const job = this.jobs.get(jobName);
      if (!job) return;

      if (job.isRunning) {
        logger.warn(
          `Cron job ${jobName} is already running, skipping this execution`,
        );
        return;
      }

      job.isRunning = true;
      job.lastRun = new Date();

      try {
        logger.info(`Starting cron job: ${jobName}`, {
          jobName,
          schedule: config.schedule,
          description: config.description,
        });

        await handler();

        job.runCount++;
        logger.info(`Cron job completed successfully: ${jobName}`, {
          jobName,
          runCount: job.runCount,
          duration: Date.now() - job.lastRun.getTime(),
        });
      } catch (error) {
        job.errorCount++;
        logger.error(`Cron job failed: ${jobName}`, error as Error, {
          jobName,
          runCount: job.runCount,
          errorCount: job.errorCount,
        });
      } finally {
        job.isRunning = false;
        // Calculate next run time
        job.nextRun = this.getNextRunTime(config.schedule);
      }
    };

    const task = cron.schedule(config.schedule, wrappedHandler, {
      scheduled: false, // Don't start immediately
      timezone: config.timezone,
    });

    this.jobs.set(jobName, {
      name: jobName,
      task,
      isRunning: false,
      runCount: 0,
      errorCount: 0,
    });

    logger.info(`Cron job registered: ${jobName}`, {
      jobName,
      schedule: config.schedule,
      timezone: config.timezone,
      description: config.description,
    });
  }

  /**
   * Start all registered cron jobs
   */
  startAll(): void {
    if (this.isInitialized) {
      logger.warn("Cron scheduler already initialized");
      return;
    }

    let startedCount = 0;
    this.jobs.forEach((job, jobName) => {
      try {
        job.task.start();
        job.nextRun = this.getNextRunTime(
          getCronSchedule(jobName as keyof typeof CRON_SCHEDULES).schedule,
        );
        startedCount++;
        logger.info(`Started cron job: ${jobName}`);
      } catch (error) {
        logger.error(`Failed to start cron job: ${jobName}`, error as Error);
      }
    });

    this.isInitialized = true;
    logger.info(
      `Cron scheduler initialized with ${startedCount}/${this.jobs.size} jobs started`,
    );
  }

  /**
   * Stop all cron jobs
   */
  stopAll(): void {
    let stoppedCount = 0;
    this.jobs.forEach((job, jobName) => {
      try {
        job.task.stop();
        stoppedCount++;
        logger.info(`Stopped cron job: ${jobName}`);
      } catch (error) {
        logger.error(`Failed to stop cron job: ${jobName}`, error as Error);
      }
    });

    this.isInitialized = false;
    logger.info(`Stopped ${stoppedCount}/${this.jobs.size} cron jobs`);
  }

  /**
   * Stop a specific job
   */
  stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (!job) {
      logger.warn(`Cron job not found: ${jobName}`);
      return false;
    }

    try {
      job.task.stop();
      logger.info(`Stopped cron job: ${jobName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to stop cron job: ${jobName}`, error as Error);
      return false;
    }
  }

  /**
   * Start a specific job
   */
  startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (!job) {
      logger.warn(`Cron job not found: ${jobName}`);
      return false;
    }

    try {
      job.task.start();
      job.nextRun = this.getNextRunTime(
        getCronSchedule(jobName as keyof typeof CRON_SCHEDULES).schedule,
      );
      logger.info(`Started cron job: ${jobName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to start cron job: ${jobName}`, error as Error);
      return false;
    }
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus(): Array<{
    name: string;
    isRunning: boolean;
    lastRun?: Date;
    nextRun?: Date;
    runCount: number;
    errorCount: number;
    isScheduled: boolean;
  }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      isRunning: job.isRunning,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      runCount: job.runCount,
      errorCount: job.errorCount,
      isScheduled: this.isJobRunning(job.task),
    }));
  }

  /**
   * Check if a cron task is currently scheduled/running
   */
  private isJobRunning(task: cron.ScheduledTask): boolean {
    try {
      // Since ScheduledTask doesn't expose running status directly,
      // we'll return true if the task exists (assuming it's scheduled)
      return task ? true : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate next run time for a cron schedule
   */
  private getNextRunTime(schedule: string): Date {
    try {
      // This is a simple approximation - for production use a proper cron parser
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      return nextHour;
    } catch (error) {
      logger.error("Failed to calculate next run time", error as Error);
      return new Date();
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down cron scheduler...");

    // Wait for running jobs to complete (with timeout)
    const runningJobs = Array.from(this.jobs.values()).filter(
      (job) => job.isRunning,
    );
    if (runningJobs.length > 0) {
      logger.info(
        `Waiting for ${runningJobs.length} running jobs to complete...`,
      );

      const timeout = 30000; // 30 seconds timeout
      const startTime = Date.now();

      while (
        runningJobs.some((job) => job.isRunning) &&
        Date.now() - startTime < timeout
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    this.stopAll();
    logger.info("Cron scheduler shutdown complete");
  }
}

// Singleton instance
export const cronScheduler = new CronScheduler();

import { initializeAttendanceCron } from './jobs/attendance.cron';
import { initializeReportCrons } from './jobs/report.cron';

export const initializeCronJobs = (): void => {
  initializeAttendanceCron();
  initializeReportCrons();
};
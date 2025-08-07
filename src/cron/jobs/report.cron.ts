import cron from 'node-cron';
import { cronConfig } from '../config';
import { 
  sendReportReminderToTeams,
  sendReportToTeams 
} from '../../controllers/report/reportController';

export const initializeReportCrons = (): void => {
  // Report reminder cron
  cron.schedule(
    cronConfig.reportReminder.schedule,
    () => {
      sendReportReminderToTeams();
    },
    {
      timezone: cronConfig.reportReminder.timezone,
    }
  );

  // Report submission cron
  cron.schedule(
    cronConfig.report.schedule,
    () => {
      sendReportToTeams();
    },
    {
      timezone: cronConfig.report.timezone,
    }
  );
};
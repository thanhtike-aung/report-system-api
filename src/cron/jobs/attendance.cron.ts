import cron from 'node-cron';
import { cronConfig } from '../config';
import { sendAttendanceToTeams } from '../../controllers/attendance/attendanceController';

export const initializeAttendanceCron = (): void => {
  cron.schedule(
    cronConfig.attendance.schedule,
    () => {
      sendAttendanceToTeams();
    },
    {
      timezone: cronConfig.attendance.timezone,
    }
  );
};
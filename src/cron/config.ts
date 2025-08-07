import { CronConfig } from '../types/cron';

export const cronConfig: CronConfig = {
  attendance: {
    schedule: '30 08 * * 1-5',
    timezone: 'Asia/Yangon'
  },
  reportReminder: {
    schedule: '30 16 * * 1-5',
    timezone: 'Asia/Yangon'
  },
  report: {
    schedule: '30 18 * * 1-5',
    timezone: 'Asia/Yangon'
  }
};
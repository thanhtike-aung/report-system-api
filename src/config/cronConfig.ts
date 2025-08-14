import { config } from "../utils/config";

export interface CronJobConfig {
  name: string;
  schedule: string;
  timezone: string;
  enabled: boolean;
  description: string;
}

export const CRON_SCHEDULES: Record<string, CronJobConfig> = {
  MORNING_ATTENDANCE: {
    name: "morning_attendance",
    schedule: "30 08 * * 1-5", // 8:30 AM, Monday to Friday
    timezone: "Asia/Yangon",
    enabled: config.NODE_ENV !== 'test', // Disable in test environment
    description: "Send morning attendance message to Microsoft Teams"
  },
  EVENING_REPORT_REMINDER: {
    name: "evening_report_reminder",
    schedule: "30 16 * * 1-5", // 4:30 PM, Monday to Friday
    timezone: "Asia/Yangon",
    enabled: config.NODE_ENV !== 'test',
    description: "Send evening report reminder to Microsoft Teams"
  },
  EVENING_REPORT: {
    name: "evening_report",
    schedule: "30 18 * * 1-5", // 6:30 PM, Monday to Friday
    timezone: "Asia/Yangon",
    enabled: config.NODE_ENV !== 'test',
    description: "Send evening report message to Microsoft Teams"
  }
};

// Allow environment-specific schedule overrides
export const getCronSchedule = (jobName: keyof typeof CRON_SCHEDULES): CronJobConfig => {
  const defaultConfig = CRON_SCHEDULES[jobName];
  
  // Check for environment variable overrides
  const envScheduleKey = `CRON_${jobName}_SCHEDULE`;
  const envEnabledKey = `CRON_${jobName}_ENABLED`;
  
  return {
    ...defaultConfig,
    schedule: process.env[envScheduleKey] || defaultConfig.schedule,
    enabled: process.env[envEnabledKey] 
      ? process.env[envEnabledKey] === 'true' 
      : defaultConfig.enabled
  };
};

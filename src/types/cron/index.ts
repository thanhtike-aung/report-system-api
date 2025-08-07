export interface CronJobConfig {
  schedule: string;
  timezone: string;
}

export interface CronConfig {
  attendance: CronJobConfig;
  reportReminder: CronJobConfig;
  report: CronJobConfig;
}
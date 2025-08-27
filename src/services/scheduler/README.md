# Cron Job Scheduler

This module provides a robust cron job scheduling system for the report system API.

## Architecture

```
src/services/scheduler/
├── cronScheduler.ts      # Main scheduler class
├── jobs/
│   ├── index.ts         # Job initialization
│   ├── attendanceJobs.ts # Attendance-related jobs
│   └── reportJobs.ts    # Report-related jobs
└── README.md           # This file
```

## Features

- **Centralized Management**: All cron jobs are managed through a single scheduler
- **Error Handling**: Comprehensive error handling with logging
- **Job Status Monitoring**: Track job execution status, run counts, and errors
- **Graceful Shutdown**: Properly handles application shutdown
- **Environment Configuration**: Jobs can be disabled in test environments
- **Schedule Override**: Environment variables can override default schedules

## Configuration

Jobs are configured in `src/config/cronConfig.ts`:

```typescript
export const CRON_SCHEDULES = {
  MORNING_ATTENDANCE: {
    name: "morning_attendance",
    schedule: "30 08 * * 1-5", // 8:30 AM, Monday to Friday
    timezone: "Asia/Yangon",
    enabled: config.NODE_ENV !== "test",
    description: "Send morning attendance message to Microsoft Teams",
  },
  // ... other jobs
};
```

## Environment Variables

You can override job schedules using environment variables:

```bash
# Override morning attendance schedule
CRON_MORNING_ATTENDANCE_SCHEDULE="0 09 * * 1-5"

# Disable a specific job
CRON_MORNING_ATTENDANCE_ENABLED=false
```

## Usage

### Initialize Jobs

```typescript
import { initializeCronJobs } from "./services/scheduler/jobs";

initializeCronJobs();
```

### Shutdown Jobs

```typescript
import { shutdownCronJobs } from "./services/scheduler/jobs";

await shutdownCronJobs();
```

### Monitor Job Status

```typescript
import { getCronJobsStatus } from "./services/scheduler/jobs";

const status = getCronJobsStatus();
```

## API Endpoints

- `GET /health` - System health check
- `GET /system/cron-status` - Get cron job status (requires authentication)

## Adding New Jobs

1. Create job function in appropriate file under `jobs/`
2. Register the job in the setup function
3. Add configuration to `cronConfig.ts`

Example:

```typescript
// In jobs/myJobs.ts
export const setupMyJobs = (): void => {
  cronScheduler.registerJob("MY_JOB", async () => {
    // Job implementation
  });
};

// In jobs/index.ts
import { setupMyJobs } from "./myJobs";

export const initializeCronJobs = (): void => {
  setupMyJobs();
  // ... other jobs
  cronScheduler.startAll();
};
```

## Job Execution Flow

1. Job is registered with scheduler
2. Scheduler starts all enabled jobs
3. At scheduled time, job wrapper executes:
   - Sets job as running
   - Logs start time
   - Executes job function
   - Logs completion/error
   - Updates run/error counts
   - Sets job as not running

## Monitoring

Each job tracks:

- `isRunning`: Whether job is currently executing
- `lastRun`: Last execution time
- `nextRun`: Next scheduled execution (approximate)
- `runCount`: Total successful executions
- `errorCount`: Total failed executions
- `isScheduled`: Whether job is scheduled

## Best Practices

1. **Idempotent Jobs**: Ensure jobs can be safely re-run
2. **Error Handling**: Handle errors gracefully within job functions
3. **Logging**: Use structured logging for debugging
4. **Timeouts**: Implement timeouts for long-running jobs
5. **Resource Cleanup**: Clean up resources after job completion

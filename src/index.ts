import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { setAuthRoutes } from "./routes/authRoutes";
import { setUserRoutes } from "./routes/userRoutes";
import { setProjectRoutes } from "./routes/projectRoutes";
import { setAttendanceRoutes } from "./routes/attendanceRoutes";
import { setReportRoutes } from "./routes/reportRoutes";
import { setAdaptiveCardMessageRoutes } from "./routes/adaptiveCardMessageRoutes";
import { setSystemRoutes } from "./routes/systemRoutes";
import { errorHandler } from "./middlewares/errorHandlerMiddleware";
import { requestLogger } from "./middlewares/requestLogger";
import { config, validateConfig } from "./utils/config";
import { logger } from "./utils/logger";
import { initializeCronJobs, shutdownCronJobs } from "./services/scheduler/jobs";

dotenv.config();

// Validate configuration on startup
validateConfig();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(requestLogger);

// Initialize cron jobs
initializeCronJobs();

// Set up routes
setAuthRoutes(app);
setUserRoutes(app);
setAttendanceRoutes(app);
setReportRoutes(app);
setProjectRoutes(app);
setAdaptiveCardMessageRoutes(app);
setSystemRoutes(app);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.NODE_PORT, () => {
  logger.info(`Server is running on port ${config.NODE_PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error('Error during server shutdown', err);
      process.exit(1);
    }
    
    try {
      // Shutdown cron jobs
      await shutdownCronJobs();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', error as Error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', new Error(String(reason)), { promise: String(promise) });
  gracefulShutdown('unhandledRejection');
});

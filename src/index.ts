import 'dotenv/config';
import { createApp } from './app';
import { config } from './config';
import { initializeCronJobs } from './cron';
import logger from './utils/logger';

const startServer = async () => {
  try {
    const app = createApp();

    initializeCronJobs();

    app.listen(config.server.port, () => {
      logger.info(`Server is running on port ${config.server.port} in ${config.env} mode`);
      
      if (config.env !== 'production') {
        logger.info(`API Documentation available at http://localhost:${config.server.port}/api-docs`);
      }
    });

    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      process.exit(1);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { responseInterceptor } from './middleware/responseInterceptor';
import { config } from './config';

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: config.server.cors.origin,
    credentials: true
  }));

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Response formatting
  app.use(responseInterceptor);

  // API routes
  app.use('/api', apiRoutes);

  // Swagger documentation
  if (config.env !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const { swaggerSpec } = require('./docs/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling
  app.use(errorHandler);

  return app;
};
import dotenv from 'dotenv';
import { AppError } from '../utils/errors/AppError';
import development from './environments/development';
import production from './environments/production';
import test from './environments/test';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
] as const;

function validateEnv(): void {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new AppError(`Missing required environment variable: ${envVar}`, 500, false);
    }
  }
}

validateEnv();

type Environment = 'development' | 'production' | 'test';

const environments = {
  development,
  production,
  test
};

const nodeEnv = (process.env.NODE_ENV || 'development') as Environment;

if (!environments[nodeEnv]) {
  throw new AppError(`Invalid NODE_ENV: ${nodeEnv}`, 500, false);
}

export const config = {
  env: nodeEnv,
  ...environments[nodeEnv]
};
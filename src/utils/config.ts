import { InternalServerError } from "./errors";

export interface AppConfig {
  NODE_PORT: number;
  JWT_SECRET: string;
  DATABASE_URL?: string;
  NODE_ENV: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  TEAMS_WEBHOOK_URL?: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new InternalServerError(
      `Environment variable ${key} is required but not defined`,
    );
  }
  return value;
};

const getEnvVarAsNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new InternalServerError(
      `Environment variable ${key} is required but not defined`,
    );
  }

  const parsed = Number(value || defaultValue);
  if (isNaN(parsed)) {
    throw new InternalServerError(
      `Environment variable ${key} must be a valid number`,
    );
  }

  return parsed;
};

const getOptionalEnvVar = (
  key: string,
  defaultValue?: string,
): string | undefined => {
  return process.env[key] || defaultValue;
};

export const config: AppConfig = {
  NODE_PORT: getEnvVarAsNumber("NODE_PORT", 3000),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  DATABASE_URL: getOptionalEnvVar("DATABASE_URL"),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  EMAIL_USER: getOptionalEnvVar("EMAIL_USER"),
  EMAIL_PASS: getOptionalEnvVar("EMAIL_PASS"),
  TEAMS_WEBHOOK_URL: getOptionalEnvVar("TEAMS_WEBHOOK_URL"),
};

export const validateConfig = (): void => {
  // Validate required configurations
  if (!config.JWT_SECRET) {
    throw new InternalServerError("JWT_SECRET is required");
  }

  // if (config.JWT_SECRET.length < 32) {
  //   throw new InternalServerError('JWT_SECRET must be at least 32 characters long');
  // }

  if (config.NODE_PORT < 1 || config.NODE_PORT > 65535) {
    throw new InternalServerError("NODE_PORT must be between 1 and 65535");
  }

  console.log("Configuration validated successfully");
};

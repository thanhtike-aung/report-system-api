import { config } from "./config";

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = config.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (context) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      logMessage += ` | Error: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }
    
    return logMessage;
  }

  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  public error(message: string, error?: Error, context?: any): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public request(method: string, url: string, statusCode: number, duration?: number): void {
    const message = `${method} ${url} - ${statusCode}${duration ? ` (${duration}ms)` : ''}`;
    this.info(message);
  }
}

export const logger = new Logger();

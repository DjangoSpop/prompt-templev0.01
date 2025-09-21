import { env, isDevelopment, isProduction } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: Error | string;
  [key: string]: any;
}

class Logger {
  private isDev = isDevelopment();
  private isProd = isProduction();

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context,
    };

    if (this.isDev) {
      // Pretty format for development
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${
        context ? `\n${JSON.stringify(context, null, 2)}` : ''
      }`;
    }

    // JSON format for production
    return JSON.stringify(logEntry);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        if (this.isDev) console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        // In production, you might want to send to external service
        if (this.isProd) {
          this.sendToExternalService(level, message, context);
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  // HTTP request logging
  httpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Omit<LogContext, 'method' | 'url' | 'statusCode' | 'duration'>
  ): void {
    const level: LogLevel = statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    
    this.log(level, message, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'http_request',
    });
  }

  // API operation logging
  apiOperation(
    operation: string,
    success: boolean,
    duration: number,
    context?: LogContext
  ): void {
    const level: LogLevel = success ? 'info' : 'error';
    const message = `API ${operation} ${success ? 'succeeded' : 'failed'} in ${duration}ms`;
    
    this.log(level, message, {
      ...context,
      operation,
      success,
      duration,
      type: 'api_operation',
    });
  }

  // Database operation logging
  dbOperation(
    query: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    const level: LogLevel = success ? 'debug' : 'error';
    const message = `DB query ${success ? 'executed' : 'failed'} in ${duration}ms`;
    
    this.log(level, message, {
      ...context,
      query: this.isDev ? query : '[REDACTED]',
      duration,
      success,
      type: 'db_operation',
    });
  }

  // Authentication logging
  authEvent(
    event: 'login' | 'logout' | 'register' | 'refresh' | 'failed_login',
    userId?: string,
    context?: LogContext
  ): void {
    const level: LogLevel = event === 'failed_login' ? 'warn' : 'info';
    const message = `Auth event: ${event}`;
    
    this.log(level, message, {
      ...context,
      userId,
      event,
      type: 'auth_event',
    });
  }

  // Security logging
  securityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high',
    context?: LogContext
  ): void {
    const level: LogLevel = severity === 'high' ? 'error' : 'warn';
    const message = `Security event: ${event} (${severity} severity)`;
    
    this.log(level, message, {
      ...context,
      event,
      severity,
      type: 'security_event',
    });
  }

  private sendToExternalService(level: LogLevel, message: string, context?: LogContext): void {
    // Implement external logging service integration
    // Examples: Sentry, DataDog, CloudWatch, etc.
    if (env.SENTRY_DSN) {
      // Send to Sentry
      // Implementation depends on your chosen service
    }
  }
}

export const logger = new Logger();

// Request logging middleware helper
export function createRequestLogger() {
  return function logRequest(
    method: string,
    url: string,
    statusCode: number,
    startTime: number,
    context?: LogContext
  ) {
    const duration = Date.now() - startTime;
    logger.httpRequest(method, url, statusCode, duration, context);
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }

  end(success: boolean = true, context?: LogContext): number {
    const duration = Date.now() - this.startTime;
    logger.apiOperation(this.operation, success, duration, context);
    return duration;
  }
}

export function monitor(operation: string): PerformanceMonitor {
  return new PerformanceMonitor(operation);
}
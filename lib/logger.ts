type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, ...args: any[]) {
    return `[${level.toUpperCase()}] ${new Date().toISOString()}: ${message}`;
  }

  info(message: string, ...args: any[]) {
    if (this.isDev) {
      console.info(this.formatMessage('info', message), ...args);
    }
    // In production, we could send this to an external service like Sentry or Logtail
  }

  warn(message: string, ...args: any[]) {
    if (this.isDev) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: any[]) {
    // We always want to see errors, but maybe mask sensitive info in production
    if (this.isDev) {
      console.error(this.formatMessage('error', message), ...args);
    } else {
      // In production, log a sanitized version or send to monitoring
      console.error(`[ERROR] ${message}`);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }
}

export const logger = new Logger();

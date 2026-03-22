/* eslint-disable no-console */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, ..._args: unknown[]) {
    return `[${level.toUpperCase()}] ${new Date().toISOString()}: ${message}`;
  }

  info(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.error(this.formatMessage('error', message), ...args);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }
}

export const logger = new Logger();

import pb from './pocketbase';

export interface LogEntry {
  id?: string;
  user_id?: string;
  error_message: string;
  stack_trace?: string;
  path: string;
  timestamp?: string;
  expand?: {
    user_id?: {
      name: string;
      email: string;
      avatar?: string;
    };
  };
}

export async function logError(error: Error | string, path: string, userId?: string) {
  try {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    await pb.collection('logs').create({
      user_id: userId || pb.authStore.model?.id,
      error_message: message,
      stack_trace: stack,
      path: path,
    });
  } catch (err) {
    console.error('Failed to log error to PocketBase:', err);
  }
}

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
  info: (msg: string, ...args: any[]) => console.info(`[INFO] ${msg}`, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (msg: string, ...args: any[]) => {
    console.error(`[ERROR] ${msg}`, ...args);
    // Automatically log critical errors to DB if possible
    logError(msg, window.location.pathname);
  },
  logError: logError
};

export interface LogContext {
  error?: unknown;
  [key: string]: unknown;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogHandler = (
  level: LogLevel,
  message: string,
  data: Record<string, unknown>,
) => void;

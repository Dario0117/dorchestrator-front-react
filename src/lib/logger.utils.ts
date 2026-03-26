/** biome-ignore-all lint/suspicious/noConsole: logging */
import type { LogContext, LogHandler, LogLevel } from '@lib/logger.utils.types';
import { trace } from '@opentelemetry/api';

const LOG_LEVEL_TO_CONSOLE_METHOD = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const satisfies Record<LogLevel, keyof Console>;

const defaultLogHandler: LogHandler = (level, message, data) => {
  const method = LOG_LEVEL_TO_CONSOLE_METHOD[level];
  console[method](message, data);
};

let activeHandler: LogHandler = defaultLogHandler;

export function configureLogHandler(handler: LogHandler) {
  activeHandler = handler;
}

export function resetLogHandler() {
  activeHandler = defaultLogHandler;
}

function getTraceContext() {
  const span = trace.getActiveSpan();
  if (!span) {
    return { traceId: undefined, spanId: undefined };
  }
  const ctx = span.spanContext();
  return { traceId: ctx.traceId, spanId: ctx.spanId };
}

function buildStructuredLog(ctx: LogContext, message: string) {
  const { traceId, spanId } = getTraceContext();
  const { error, ...attributes } = ctx;
  return {
    msg: message,
    ...(traceId ? { traceId } : {}),
    ...(spanId ? { spanId } : {}),
    ...(error !== undefined ? { error } : {}),
    ...attributes,
    timestamp: new Date().toISOString(),
  };
}

function log(level: LogLevel, ctx: LogContext, message: string) {
  activeHandler(level, message, buildStructuredLog(ctx, message));
}

export function logWarning(ctx: LogContext, message: string) {
  log('warn', ctx, message);
}

export function logError(ctx: LogContext, message: string) {
  log('error', ctx, message);
}

export function logInfo(ctx: LogContext, message: string) {
  log('info', ctx, message);
}

export function logDebug(ctx: LogContext, message: string) {
  log('debug', ctx, message);
}

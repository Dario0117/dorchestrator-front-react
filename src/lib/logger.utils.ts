/** biome-ignore-all lint/suspicious/noConsole: logging */
import type { LogContext } from '@lib/logger.utils.types';
import { trace } from '@opentelemetry/api';

function getTraceContext(): {
  traceId: string | undefined;
  spanId: string | undefined;
} {
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

export function logWarning(ctx: LogContext, message: string) {
  console.warn(message, buildStructuredLog(ctx, message));
}

export function logError(ctx: LogContext, message: string) {
  console.error(message, buildStructuredLog(ctx, message));
}

export function logInfo(ctx: LogContext, message: string) {
  console.info(message, buildStructuredLog(ctx, message));
}

export function logDebug(ctx: LogContext, message: string) {
  console.log(message, buildStructuredLog(ctx, message));
}

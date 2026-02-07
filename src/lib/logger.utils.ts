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

function buildStructuredLog(ctx: LogContext) {
  const { traceId, spanId } = getTraceContext();
  return {
    msg: ctx.message,
    ...(traceId ? { traceId } : {}),
    ...(spanId ? { spanId } : {}),
    ...(ctx.error !== undefined ? { error: ctx.error } : {}),
    ...(ctx.attributes ? ctx.attributes : {}),
    timestamp: new Date().toISOString(),
  };
}

export function logWarning(ctx: LogContext) {
  console.warn(ctx.message, buildStructuredLog(ctx));
}

export function logError(ctx: LogContext) {
  console.error(ctx.message, buildStructuredLog(ctx));
}

export function logInfo(ctx: LogContext) {
  console.info(ctx.message, buildStructuredLog(ctx));
}

export function logDebug(ctx: LogContext) {
  console.log(ctx.message, buildStructuredLog(ctx));
}

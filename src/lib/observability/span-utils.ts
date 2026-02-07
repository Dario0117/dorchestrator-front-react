import { getTracer } from '@lib/observability/tracer';
import type { Attributes, Span } from '@opentelemetry/api';
import { SpanStatusCode, trace } from '@opentelemetry/api';

export function withSpan<T>(
  name: string,
  fn: (span: Span) => T,
  attributes?: Attributes,
): T {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, (span) => {
    if (attributes) {
      span.setAttributes(attributes);
    }
    try {
      const result = fn(span);
      if (result instanceof Promise) {
        return (result as Promise<unknown>)
          .then((resolved) => {
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
            return resolved;
          })
          .catch((error: unknown) => {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
            span.recordException(
              error instanceof Error ? error : new Error(String(error)),
            );
            span.end();
            throw error;
          }) as T;
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(
        error instanceof Error ? error : new Error(String(error)),
      );
      span.end();
      throw error;
    }
  });
}

export function addSpanAttributes(attributes: Attributes): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

export function addSpanEvent(name: string, attributes?: Attributes): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

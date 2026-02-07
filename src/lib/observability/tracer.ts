import { env } from '@lib/env.utils';
import { logDebug, logInfo, logWarning } from '@lib/logger.utils';
import { getAppVersion } from '@lib/version.utils';
import { context, propagation, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

let provider: WebTracerProvider | undefined;

export function initializeTracing(): void {
  const enabled = import.meta.env.VITE_OTEL_ENABLED === 'true';

  if (!enabled) {
    logDebug({}, 'OpenTelemetry tracing is disabled');
    return;
  }

  const serviceName =
    import.meta.env.VITE_OTEL_SERVICE_NAME ?? 'dorchestrator-web';
  const exporterType = import.meta.env.VITE_OTEL_EXPORTER_TYPE ?? 'none';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: getAppVersion(),
    'deployment.environment': env.IS_DEV ? 'development' : 'production',
  });

  const spanProcessors: SpanProcessor[] = [];

  if (exporterType === 'console') {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  } else if (exporterType === 'otlp') {
    const endpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT;
    if (endpoint) {
      spanProcessors.push(
        new SimpleSpanProcessor(new OTLPTraceExporter({ url: endpoint })),
      );
    } else {
      logWarning(
        {},
        'OTLP exporter type selected but no endpoint configured (VITE_OTEL_EXPORTER_OTLP_ENDPOINT)',
      );
    }
  }

  provider = new WebTracerProvider({
    resource,
    spanProcessors,
  });

  propagation.setGlobalPropagator(new W3CTraceContextPropagator());

  provider.register();

  logInfo({ serviceName, exporterType }, 'OpenTelemetry tracing initialized');
}

export function getTracer(name = 'dorchestrator-web') {
  return trace.getTracer(name);
}

export function getTracePropagationHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  propagation.inject(context.active(), headers);
  return headers;
}

export async function shutdownTracing(): Promise<void> {
  if (provider) {
    await provider.shutdown();
  }
}

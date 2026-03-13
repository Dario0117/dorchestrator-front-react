import {
  addSpanAttributes,
  addSpanEvent,
  withSpan,
} from '@lib/observability/span-utils';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

let exporter: InMemorySpanExporter;
let provider: WebTracerProvider;

beforeEach(() => {
  exporter = new InMemorySpanExporter();
  provider = new WebTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });
  provider.register();
});

afterEach(async () => {
  await provider.shutdown();
  trace.disable();
});

function getOnlySpan() {
  const spans = exporter.getFinishedSpans();
  expect(spans).toHaveLength(1);
  return spans[0] as (typeof spans)[number];
}

describe('withSpan', () => {
  it('sets OK status and ends span for successful sync function', () => {
    const result = withSpan('sync-ok', () => 42);

    expect(result).toBe(42);

    const span = getOnlySpan();
    expect(span.name).toBe('sync-ok');
    expect(span.status.code).toBe(SpanStatusCode.OK);
  });

  it('sets OK status and ends span for successful async function', async () => {
    const result = await withSpan('async-ok', () => Promise.resolve('hello'));

    expect(result).toBe('hello');

    const span = getOnlySpan();
    expect(span.name).toBe('async-ok');
    expect(span.status.code).toBe(SpanStatusCode.OK);
  });

  it('sets ERROR status, records exception, and re-throws for sync throw', () => {
    const error = new Error('sync failure');

    expect(() =>
      withSpan('sync-error', () => {
        throw error;
      }),
    ).toThrow(error);

    const span = getOnlySpan();
    expect(span.status.code).toBe(SpanStatusCode.ERROR);
    expect(span.status.message).toBe('sync failure');
    expect(span.events).toHaveLength(1);
    expect(span.events[0]).toEqual(
      expect.objectContaining({ name: 'exception' }),
    );
  });

  it('sets ERROR status, records exception, and re-throws for async rejection', async () => {
    const error = new Error('async failure');

    await expect(
      withSpan('async-error', () => Promise.reject(error)),
    ).rejects.toThrow(error);

    const span = getOnlySpan();
    expect(span.status.code).toBe(SpanStatusCode.ERROR);
    expect(span.status.message).toBe('async failure');
    expect(span.events).toHaveLength(1);
    expect(span.events[0]).toEqual(
      expect.objectContaining({ name: 'exception' }),
    );
  });

  it('passes attributes to span when provided', () => {
    withSpan('with-attrs', () => 'ok', {
      'http.method': 'GET',
      'http.url': '/api',
    });

    const span = getOnlySpan();
    expect(span.attributes['http.method']).toBe('GET');
    expect(span.attributes['http.url']).toBe('/api');
  });

  it('handles non-Error throw (string throw)', () => {
    expect(() =>
      withSpan('string-error', () => {
        // biome-ignore lint/style/useThrowOnlyError: testing non-Error throw handling
        throw 'string error';
      }),
    ).toThrow('string error');

    const span = getOnlySpan();
    expect(span.status.code).toBe(SpanStatusCode.ERROR);
    expect(span.status.message).toBe('Unknown error');
    expect(span.events).toHaveLength(1);
    expect(span.events[0]).toEqual(
      expect.objectContaining({ name: 'exception' }),
    );
  });
});

describe('addSpanAttributes', () => {
  it('sets attributes on active span', () => {
    withSpan('parent', () => {
      addSpanAttributes({ 'custom.key': 'value' });
    });

    const span = getOnlySpan();
    expect(span.attributes['custom.key']).toBe('value');
  });

  it('does nothing when no active span', () => {
    expect(() => addSpanAttributes({ key: 'value' })).not.toThrow();
  });
});

describe('addSpanEvent', () => {
  it('adds event to active span', () => {
    withSpan('parent', () => {
      addSpanEvent('my-event', { detail: 'info' });
    });

    const span = getOnlySpan();
    expect(span.events).toHaveLength(1);
    expect(span.events[0]).toEqual(
      expect.objectContaining({
        name: 'my-event',
        attributes: expect.objectContaining({ detail: 'info' }),
      }),
    );
  });

  it('does nothing when no active span', () => {
    expect(() => addSpanEvent('orphan-event')).not.toThrow();
  });
});

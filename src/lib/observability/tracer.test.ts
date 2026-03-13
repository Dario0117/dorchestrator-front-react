import {
  getTracePropagationHeaders,
  getTracer,
  shutdownTracing,
} from '@lib/observability/tracer';

describe('tracer', () => {
  describe('getTracer', () => {
    it('returns a tracer object', () => {
      const tracer = getTracer();

      expect(tracer).toBeDefined();
      expect(typeof tracer.startSpan).toBe('function');
      expect(typeof tracer.startActiveSpan).toBe('function');
    });

    it('returns a tracer with a custom name', () => {
      const tracer = getTracer('custom-tracer');

      expect(tracer).toBeDefined();
      expect(typeof tracer.startSpan).toBe('function');
    });
  });

  describe('getTracePropagationHeaders', () => {
    it('returns a Record<string, string>', () => {
      const headers = getTracePropagationHeaders();

      expect(headers).toBeDefined();
      expect(typeof headers).toBe('object');
      // When no provider is configured, headers will be empty
      expect(headers).toEqual(expect.any(Object));
    });
  });

  describe('shutdownTracing', () => {
    it('resolves without error when no provider exists', async () => {
      await expect(shutdownTracing()).resolves.toBeUndefined();
    });
  });
});

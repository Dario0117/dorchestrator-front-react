import { env } from '@lib/env.utils';

describe('env utils', () => {
  describe('env object', () => {
    it('should have BACKEND_BASE_URL defined', () => {
      expect(env.BACKEND_BASE_URL).toBeDefined();
      expect(typeof env.BACKEND_BASE_URL).toBe('string');
    });

    it('should have FRONTEND_BASE_URL defined', () => {
      expect(env.FRONTEND_BASE_URL).toBeDefined();
      expect(typeof env.FRONTEND_BASE_URL).toBe('string');
    });

    it('should return APP_VERSION', () => {
      const version = env.APP_VERSION;
      expect(typeof version).toBe('string');
    });

    it('should return IS_DEV boolean', () => {
      const isDev = env.IS_DEV;
      expect(typeof isDev).toBe('boolean');
    });

    it('should return OTEL_ENABLED boolean', () => {
      const enabled = env.OTEL_ENABLED;
      expect(typeof enabled).toBe('boolean');
    });

    it('should return OTEL_SERVICE_NAME string', () => {
      const name = env.OTEL_SERVICE_NAME;
      expect(typeof name).toBe('string');
    });

    it('should return OTEL_EXPORTER_TYPE string', () => {
      const type = env.OTEL_EXPORTER_TYPE;
      expect(typeof type).toBe('string');
    });

    it('should return OTEL_EXPORTER_OTLP_ENDPOINT as string or undefined', () => {
      const endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT;
      expect(endpoint === undefined || typeof endpoint === 'string').toBe(true);
    });
  });
});

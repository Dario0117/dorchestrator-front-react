import { env } from '@lib/env.utils';

describe('env utils', () => {
  describe('requireEnv — happy path via dynamic import', () => {
    it('should successfully load env when required variables are defined', async () => {
      vi.resetModules();
      const { env: freshEnv } = await import('@lib/env.utils');
      expect(freshEnv.BACKEND_BASE_URL).toBeDefined();
      expect(freshEnv.FRONTEND_BASE_URL).toBeDefined();
    });
  });

  describe('requireEnv — error path via dynamic import', () => {
    it('should throw when BACKEND_BASE_URL is missing', async () => {
      vi.resetModules();
      const originalBackendUrl = import.meta.env.BACKEND_BASE_URL;
      import.meta.env.BACKEND_BASE_URL = '';

      await expect(() => import('@lib/env.utils')).rejects.toThrow(
        'Missing required environment variable: BACKEND_BASE_URL',
      );

      import.meta.env.BACKEND_BASE_URL = originalBackendUrl;
    });

    it('should throw when FRONTEND_BASE_URL is missing', async () => {
      vi.resetModules();
      const originalFrontendUrl = import.meta.env.FRONTEND_BASE_URL;
      import.meta.env.FRONTEND_BASE_URL = '';

      await expect(() => import('@lib/env.utils')).rejects.toThrow(
        'Missing required environment variable: FRONTEND_BASE_URL',
      );

      import.meta.env.FRONTEND_BASE_URL = originalFrontendUrl;
    });
  });

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

    it('should handle APP_VERSION fallback', () => {
      // APP_VERSION falls back to "unknown" when VITE_APP_VERSION is not set
      expect(env.APP_VERSION).toBeDefined();
      expect(env.APP_VERSION.length).toBeGreaterThan(0);
    });
  });
});

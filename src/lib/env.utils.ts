function requireEnv(key: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file.`,
    );
  }
  return value;
}

// Validate required env vars at module load time
const backendBaseUrl = requireEnv(
  'BACKEND_BASE_URL',
  import.meta.env.BACKEND_BASE_URL,
);
const frontendBaseUrl = requireEnv(
  'FRONTEND_BASE_URL',
  import.meta.env.FRONTEND_BASE_URL,
);
const realtimeWsUrl = requireEnv(
  'REALTIME_WS_URL',
  import.meta.env.REALTIME_WS_URL,
);

export const env = {
  BACKEND_BASE_URL: backendBaseUrl,
  FRONTEND_BASE_URL: frontendBaseUrl,
  REALTIME_WS_URL: realtimeWsUrl,

  get APP_VERSION() {
    return (import.meta.env.VITE_APP_VERSION as string) || 'unknown';
  },

  get IS_DEV() {
    return import.meta.env.DEV;
  },

  get OTEL_ENABLED() {
    return import.meta.env.VITE_OTEL_ENABLED === 'true';
  },

  get OTEL_SERVICE_NAME() {
    return (
      (import.meta.env.VITE_OTEL_SERVICE_NAME as string) ?? 'dorchestrator-web'
    );
  },

  get OTEL_EXPORTER_TYPE() {
    return (import.meta.env.VITE_OTEL_EXPORTER_TYPE as string) ?? 'none';
  },

  get OTEL_EXPORTER_OTLP_ENDPOINT() {
    return import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT as
      | string
      | undefined;
  },
} as const;

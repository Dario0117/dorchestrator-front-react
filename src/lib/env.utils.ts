/**
 * Centralized environment variable configuration with validation.
 * All environment variables should be accessed through this module.
 */

/**
 * Validates that a required environment variable is defined.
 * Throws an error at initialization if the variable is missing.
 */
function requireEnv(key: string, value: string | undefined): string {
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

/**
 * Environment configuration object.
 * All environment variables are validated and typed here.
 *
 * Note: IS_DEV and APP_VERSION use getters to allow test manipulation
 * of import.meta.env values.
 */
export const env = {
  /**
   * Base URL for the backend API.
   * Required for all API requests.
   */
  BACKEND_BASE_URL: backendBaseUrl,

  /**
   * Base URL for the frontend application.
   * Used for redirect URLs in authentication flows.
   */
  FRONTEND_BASE_URL: frontendBaseUrl,

  /**
   * Application version (git SHA).
   * Injected at build time, defaults to 'unknown' if not available.
   */
  get APP_VERSION(): string {
    return (import.meta.env.VITE_APP_VERSION as string) || 'unknown';
  },

  /**
   * Whether the app is running in development mode.
   * Vite built-in environment variable.
   */
  get IS_DEV(): boolean {
    return import.meta.env.DEV;
  },
} as const;

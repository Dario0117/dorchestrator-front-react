import { env } from '@lib/env.utils';

/**
 * Returns the current application version.
 * - In development: returns "dev"
 * - In production: returns the git SHA injected at build time
 */
export function getAppVersion(): string {
  // Check if we're in development mode
  if (env.IS_DEV) {
    return 'dev';
  }

  // In production, get the version from environment variable set at build time
  return env.APP_VERSION;
}

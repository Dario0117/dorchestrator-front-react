import { getAppVersion } from '@lib/version.utils';

describe('getAppVersion', () => {
  const originalDEV = import.meta.env.DEV;
  const originalVITE_APP_VERSION = import.meta.env.VITE_APP_VERSION;

  afterEach(() => {
    // Restore original values
    import.meta.env.DEV = originalDEV;
    import.meta.env.VITE_APP_VERSION = originalVITE_APP_VERSION;
  });

  it('should return a string value', () => {
    const version = getAppVersion();

    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('should return "dev" in development mode', () => {
    import.meta.env.DEV = true;

    const version = getAppVersion();

    expect(version).toBe('dev');
  });

  it('should return version from VITE_APP_VERSION in production mode', () => {
    import.meta.env.DEV = false;
    import.meta.env.VITE_APP_VERSION = 'abc123';

    const version = getAppVersion();

    expect(version).toBe('abc123');
  });

  it('should return "unknown" when VITE_APP_VERSION is not set in production', () => {
    import.meta.env.DEV = false;
    delete import.meta.env.VITE_APP_VERSION;

    const version = getAppVersion();

    expect(version).toBe('unknown');
  });
});

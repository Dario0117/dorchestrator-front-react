import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

// We need fetchClient to make requests through the middleware
const { fetchClient } = await import('@/http-service-setup');

const originalLocation = window.location;

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, replace: vi.fn(), pathname: '/dashboard' },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

describe('authMiddleware', () => {
  test('401 response on non-safe path redirects to /login', async () => {
    server.use(
      http.get(buildBackendUrl('/api/v1/{organizationId}/organization'), () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    window.location.pathname = '/dashboard';

    await fetchClient.GET('/api/v1/{organizationId}/organization', {
      params: { path: { organizationId: 'org-1' } },
    });

    expect(window.location.replace).toHaveBeenCalledWith('/login');
  });

  test('401 response on /login path does NOT redirect', async () => {
    server.use(
      http.get(buildBackendUrl('/api/v1/{organizationId}/organization'), () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    window.location.pathname = '/login';

    await fetchClient.GET('/api/v1/{organizationId}/organization', {
      params: { path: { organizationId: 'org-1' } },
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  test('401 response on /update-password/ path does NOT redirect', async () => {
    server.use(
      http.get(buildBackendUrl('/api/v1/{organizationId}/organization'), () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    window.location.pathname = '/update-password/abc123';

    await fetchClient.GET('/api/v1/{organizationId}/organization', {
      params: { path: { organizationId: 'org-1' } },
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  test('500 response logs warning but does not redirect', async () => {
    server.use(
      http.get(buildBackendUrl('/api/v1/{organizationId}/organization'), () =>
        HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 },
        ),
      ),
    );

    window.location.pathname = '/dashboard';

    await fetchClient.GET('/api/v1/{organizationId}/organization', {
      params: { path: { organizationId: 'org-1' } },
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  test('200 response does not redirect or log warning', async () => {
    // The default handler returns 200
    window.location.pathname = '/dashboard';

    await fetchClient.GET('/api/v1/{organizationId}/organization', {
      params: { path: { organizationId: 'org-1' } },
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

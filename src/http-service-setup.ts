import { getAppVersion } from '@lib/version.utils';
import createFetchClient, { type Middleware } from 'openapi-fetch';
import createClient from 'openapi-react-query';
import type { paths } from '@/types/api.generated.types';

const authMiddleware: Middleware = {
  // biome-ignore lint/suspicious/useAwait: no need to await
  async onResponse({ response }) {
    if (response.status === 401) {
      const safePaths = ['/login', '/update-password/'];
      const isASafePath = safePaths.some((path) =>
        window.location.pathname.startsWith(path),
      );
      if (!isASafePath) {
        window.location.replace('/login');
      }
    }
  },
};

const fetchClient = createFetchClient<paths>({
  fetch: (...args) => fetch(...args), // Fix issue with testing
  baseUrl: import.meta.env.BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': getAppVersion(),
  },
  credentials: 'include',
});
fetchClient.use(authMiddleware);

export const $api = createClient(fetchClient);

import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const listSandboxTypesHandler = http.get(
  buildBackendUrl('/api/v1/{organizationId}/sandbox/types'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [
          {
            id: 1,
            name: 'No Sandbox',
            category: 'none',
            providerType: 'native',
            available: true,
          },
          {
            id: 2,
            name: 'Docker',
            category: 'container',
            providerType: 'native',
            available: true,
          },
          {
            id: 3,
            name: 'Firecracker',
            category: 'vm',
            providerType: 'native',
            available: false,
          },
        ],
      },
      responseErrors: null,
    });
  },
);

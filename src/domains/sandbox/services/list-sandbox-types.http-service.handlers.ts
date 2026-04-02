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
            pluginType: 'native',
            available: true,
          },
          {
            id: 2,
            name: 'Docker',
            category: 'container',
            pluginType: 'native',
            available: true,
          },
          {
            id: 3,
            name: 'Firecracker',
            category: 'vm',
            pluginType: 'native',
            available: false,
          },
        ],
      },
      responseErrors: null,
    });
  },
);

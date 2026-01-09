import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

export const getOrganizationDetailsHandler = http.get(
  buildBackendUrl('/api/v1/:organizationId/organization'),
  ({ params }) => {
    const { organizationId } = params;

    return HttpResponse.json({
      responseData: {
        results: {
          id: organizationId,
          name: 'Test Organization',
          createdAt: '2025-12-21T10:00:00.000Z',
          memberCount: 1,
          deviceCount: 3,
          tier: 'free',
          deviceLimit: null,
        },
      },
      responseErrors: null,
    });
  },
);

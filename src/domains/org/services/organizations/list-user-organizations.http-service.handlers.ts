import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type ListOrganizationsSuccessResponse =
  paths['/api/v1/organizations']['get']['responses']['200']['content']['application/json'];

export const listUserOrganizationsHandler = http.get<
  never,
  never,
  ListOrganizationsSuccessResponse
>(buildBackendUrl('/api/v1/organizations'), () => {
  return HttpResponse.json({
    responseData: {
      results: [
        {
          id: 'org-1',
          name: 'Test Organization',
          slug: 'test-org',
          role: 'owner',
          memberCount: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          isDefault: true,
          teams: [],
        },
      ],
      hasNext: false,
      hasPrevious: false,
      totalResults: 1,
      totalPages: 1,
      page: 1,
      size: 100,
    },
    responseErrors: null,
  });
});

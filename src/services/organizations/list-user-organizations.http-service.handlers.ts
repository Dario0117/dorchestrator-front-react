import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type ListOrganizationsSuccessResponse =
  paths['/api/v1/organization/list']['get']['responses']['200']['content']['application/json'];

export const listUserOrganizationsHandler = http.get<
  never,
  never,
  ListOrganizationsSuccessResponse
>(buildBackendUrl('/api/v1/organization/list'), () => {
  return HttpResponse.json([
    {
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
      createdAt: '2024-01-01T00:00:00.000Z',
      logo: undefined,
      metadata: undefined,
    },
  ]);
});

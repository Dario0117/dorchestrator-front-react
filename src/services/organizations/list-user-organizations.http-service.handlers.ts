import type { Organization } from 'better-auth/plugins/organization';
import { HttpResponse, http } from 'msw';
import { buildBackendUrl } from '@/lib/test.utils';

type OrganizationListResponse = Organization[];

export const listUserOrganizationsHandler = http.get(
  buildBackendUrl('/api/v1/organization/list'),
  () => {
    const data: OrganizationListResponse = [
      {
        id: 'org-1',
        name: 'Test Organization',
        slug: 'test-org',
        createdAt: new Date(),
        logo: null,
        metadata: {},
      },
    ];
    return HttpResponse.json(data);
  },
);

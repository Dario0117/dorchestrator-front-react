import { buildBackendUrl } from '@lib/test.utils';
import type { Organization } from 'better-auth/plugins/organization';
import { HttpResponse, http } from 'msw';

type OrganizationCreateResponse = Organization & {
  metadata: unknown;
  members: Array<
    | {
        id: string;
        organizationId: string;
        userId: string;
        role: string;
        createdAt: Date;
      }
    | undefined
  >;
};

export const createOrganizationHandler = http.post(
  buildBackendUrl('/api/v1/organization/create'),
  async ({ request }) => {
    const body = (await request.json()) as { name: string; slug: string };

    const data: OrganizationCreateResponse = {
      id: 'org-123',
      name: body.name,
      slug: body.slug,
      createdAt: new Date(),
      logo: null,
      metadata: {},
      members: [],
    };

    return HttpResponse.json(data, { status: 201 });
  },
);

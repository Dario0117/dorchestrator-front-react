import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type CreateOrganizationRequestBody =
  paths['/api/v1/organization/create']['post']['requestBody']['content']['application/json'];
type CreateOrganizationSuccessResponse =
  paths['/api/v1/organization/create']['post']['responses']['200']['content']['application/json'];

export const createOrganizationHandler = http.post<
  never,
  CreateOrganizationRequestBody,
  CreateOrganizationSuccessResponse
>(buildBackendUrl('/api/v1/organization/create'), async ({ request }) => {
  const body = await request.json();

  return HttpResponse.json(
    {
      id: 'org-123',
      name: body.name,
      slug: body.slug,
      createdAt: '2024-01-01T00:00:00.000Z',
      logo: undefined,
      metadata: undefined,
    },
    { status: 201 },
  );
});

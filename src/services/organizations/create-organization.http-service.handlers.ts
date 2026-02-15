import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type CreateOrganizationRequestBody =
  paths['/api/v1/organizations']['post']['requestBody']['content']['application/json'];
type CreateOrganizationSuccessResponse =
  paths['/api/v1/organizations']['post']['responses']['201']['content']['application/json'];

export const createOrganizationHandler = http.post<
  never,
  CreateOrganizationRequestBody,
  CreateOrganizationSuccessResponse
>(buildBackendUrl('/api/v1/organizations'), async ({ request }) => {
  const body = await request.json();

  return HttpResponse.json(
    {
      responseData: {
        results: {
          id: 'org-123',
          name: body.name,
          slug: body.slug,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
      responseErrors: null,
    },
    { status: 201 },
  );
});

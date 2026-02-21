import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type SetDefaultOrganizationRequestBody =
  paths['/api/v1/organizations/default']['put']['requestBody']['content']['application/json'];
type SetDefaultOrganizationSuccessResponse =
  paths['/api/v1/organizations/default']['put']['responses']['200']['content']['application/json'];

export const setDefaultOrganizationHandler = http.put<
  never,
  SetDefaultOrganizationRequestBody,
  SetDefaultOrganizationSuccessResponse
>(buildBackendUrl('/api/v1/organizations/default'), async ({ request }) => {
  const body = await request.json();

  return HttpResponse.json({
    responseData: {
      results: [body.organizationId],
    },
    responseErrors: null,
  });
});

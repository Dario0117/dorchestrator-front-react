import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type SubmitCommandRequestBody =
  paths['/api/v1/{organizationId}/teams/{teamId}/commands']['post']['requestBody']['content']['application/json'];
type SubmitCommandSuccessResponse =
  paths['/api/v1/{organizationId}/teams/{teamId}/commands']['post']['responses']['201']['content']['application/json'];

export const submitCommandHandler = http.post<
  { organizationId: string; teamId: string },
  SubmitCommandRequestBody,
  SubmitCommandSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'), () => {
  return HttpResponse.json(
    {
      responseData: {
        results: {
          commandId: 1,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      },
      responseErrors: null,
    },
    { status: 201 },
  );
});

import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { paths } from '@/types/api.generated.types';

type RevokeSessionsSuccessResponse =
  paths['/api/v1/revoke-sessions']['post']['responses']['200']['content']['application/json'];

export const logoutAllSessionsHandler = http.post<
  never,
  never,
  RevokeSessionsSuccessResponse
>(buildBackendUrl('/api/v1/revoke-sessions'), () => {
  return HttpResponse.json({
    status: true,
  });
});

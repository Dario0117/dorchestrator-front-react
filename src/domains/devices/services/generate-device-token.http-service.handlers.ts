import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GenerateTokenPathParams =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdDevices']['parameters']['path'];
type GenerateTokenSuccessResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['201']['content']['application/json'];

export const generateDeviceTokenHandler = http.post<
  GenerateTokenPathParams,
  never,
  GenerateTokenSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'), () => {
  return HttpResponse.json({
    responseData: {
      results: {
        token: 'test-token-12345-abcdef-67890',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    responseErrors: null,
  });
});

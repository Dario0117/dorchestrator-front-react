import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ClearDeviceDefaultPathParams =
  operations['deleteApiV1ByOrganizationIdDevicesByDeviceIdSandboxDefault-preset']['parameters']['path'];
type ClearDeviceDefaultSuccessResponse =
  operations['deleteApiV1ByOrganizationIdDevicesByDeviceIdSandboxDefault-preset']['responses']['200']['content']['application/json'];

export const clearDeviceDefaultPresetHandler = http.delete<
  ClearDeviceDefaultPathParams,
  never,
  ClearDeviceDefaultSuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/default-preset',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Device default preset cleared'],
      },
      responseErrors: null,
    });
  },
);

import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SetDeviceDefaultPathParams =
  operations['putApiV1ByOrganizationIdDevicesByDeviceIdSandboxDefault-preset']['parameters']['path'];
type SetDeviceDefaultSuccessResponse =
  operations['putApiV1ByOrganizationIdDevicesByDeviceIdSandboxDefault-preset']['responses']['200']['content']['application/json'];

export const setDeviceDefaultPresetHandler = http.put<
  SetDeviceDefaultPathParams,
  never,
  SetDeviceDefaultSuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/default-preset',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Device default preset updated'],
      },
      responseErrors: null,
    });
  },
);

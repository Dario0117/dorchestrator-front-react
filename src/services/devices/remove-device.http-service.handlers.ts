import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type RemoveDeviceSuccessResponse =
  operations['deleteApiV1ByOrganizationIdDevicesByDeviceId']['responses']['200']['content']['application/json'];

// MSW path params are always strings, so we use a custom type for the handler
type RemoveDeviceMswPathParams = {
  organizationId: string;
  deviceId: string;
};

export const removeDeviceHandler = http.delete<
  RemoveDeviceMswPathParams,
  never,
  RemoveDeviceSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/devices/{deviceId}'), () => {
  return HttpResponse.json({
    responseData: {
      results: ['Device removed successfully'],
    },
    responseErrors: null,
  });
});

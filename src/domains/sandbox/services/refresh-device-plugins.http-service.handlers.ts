import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const refreshDevicePluginsHandler = http.post<{
  organizationId: string;
  deviceId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins/refresh',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Plugin refresh signal sent to device'],
      },
      responseErrors: null,
    });
  },
);

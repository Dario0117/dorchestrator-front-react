import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const installDevicePluginHandler = http.post<{
  organizationId: string;
  deviceId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins',
  ),
  () => {
    return HttpResponse.json(null, { status: 204 });
  },
);

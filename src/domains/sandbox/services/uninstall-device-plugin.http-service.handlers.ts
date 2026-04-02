import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const uninstallDevicePluginHandler = http.delete<{
  organizationId: string;
  deviceId: string;
  sandboxTypeId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/plugins/{sandboxTypeId}',
  ),
  () => {
    return HttpResponse.json(null, { status: 204 });
  },
);

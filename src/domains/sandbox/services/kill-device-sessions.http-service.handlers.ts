import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const killDeviceSessionsHandler = http.post<{
  organizationId: string;
  deviceId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/devices/{deviceId}/sandbox/kill-sessions',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['session-1', 'session-2'],
      },
      responseErrors: null,
    });
  },
);

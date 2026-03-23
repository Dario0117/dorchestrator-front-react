import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetDeviceConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];

export const getDeviceConfigHandler = http.get<
  never,
  never,
  GetDeviceConfigSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/config/{deviceId}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          config: {
            inactivityTimeoutMs: 3_600_000,
            hardCapMs: null,
            maxConcurrentSessions: 5,
            defaultWorkingDirectory: null,
            recordingRetentionDays: null,
            recordingMaxSizePerSessionBytes: null,
            recordingMaxSizePerOrgBytes: null,
          },
          inherited: true,
        },
      },
      responseErrors: null,
    });
  },
);

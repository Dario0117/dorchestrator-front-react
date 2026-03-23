import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type UpdateDeviceConfigRequestBody =
  operations['putApiV1ByOrganizationIdTerminalConfigByDeviceId']['requestBody']['content']['application/json'];
type UpdateDeviceConfigSuccessResponse =
  operations['putApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];

export const updateDeviceConfigHandler = http.put<
  never,
  UpdateDeviceConfigRequestBody,
  UpdateDeviceConfigSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/config/{deviceId}'),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      responseData: {
        results: {
          inactivityTimeoutMs: body.inactivityTimeoutMs,
          hardCapMs: body.hardCapMs,
          maxConcurrentSessions: 5,
          defaultWorkingDirectory: body.defaultWorkingDirectory,
          recordingRetentionDays: null,
          recordingMaxSizePerSessionBytes: null,
          recordingMaxSizePerOrgBytes: null,
        },
      },
      responseErrors: null,
    });
  },
);

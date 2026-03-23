import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type UpdateTerminalConfigPathParams =
  operations['putApiV1ByOrganizationIdTerminalConfig']['parameters']['path'];
type UpdateTerminalConfigRequestBody =
  operations['putApiV1ByOrganizationIdTerminalConfig']['requestBody']['content']['application/json'];
type UpdateTerminalConfigSuccessResponse =
  operations['putApiV1ByOrganizationIdTerminalConfig']['responses']['200']['content']['application/json'];

export const updateTerminalConfigHandler = http.put<
  UpdateTerminalConfigPathParams,
  UpdateTerminalConfigRequestBody,
  UpdateTerminalConfigSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/config'),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      responseData: {
        results: {
          inactivityTimeoutMs: body.inactivityTimeoutMs,
          hardCapMs: body.hardCapMs,
          maxConcurrentSessions: 5,
          defaultWorkingDirectory: null,
          recordingRetentionDays: null,
          recordingMaxSizePerSessionBytes: null,
          recordingMaxSizePerOrgBytes: null,
        },
      },
      responseErrors: null,
    });
  },
);

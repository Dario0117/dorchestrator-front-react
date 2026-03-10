import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetTerminalConfigPathParams =
  operations['getApiV1ByOrganizationIdTerminalConfig']['parameters']['path'];
type GetTerminalConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfig']['responses']['200']['content']['application/json'];

export const getTerminalConfigHandler = http.get<
  GetTerminalConfigPathParams,
  never,
  GetTerminalConfigSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/terminal/config'), () => {
  return HttpResponse.json({
    responseData: {
      results: {
        inactivityTimeoutMs: 3_600_000,
        hardCapMs: null,
        maxConcurrentSessions: 5,
        defaultWorkingDirectory: null,
        recordingRetentionDays: null,
        recordingMaxSizePerSessionBytes: null,
        recordingMaxSizePerOrgBytes: null,
      },
    },
    responseErrors: null,
  });
});

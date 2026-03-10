import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type RestoreRecordingPathParams = {
  organizationId: string;
  sessionId: string;
};
type RestoreRecordingSuccessResponse =
  operations['postApiV1ByOrganizationIdTerminalSessionsBySessionIdRecordingRestore']['responses']['201']['content']['application/json'];

export const restoreRecordingHandler = http.post<
  RestoreRecordingPathParams,
  never,
  RestoreRecordingSuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording/restore',
  ),
  ({ params }) => {
    return HttpResponse.json(
      {
        responseData: {
          results: {
            sessionId: Number(params.sessionId),
            status: 'restoring',
          },
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);

import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type RequestOverridePathParams =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdSandboxApproval-requests']['parameters']['path'];
type RequestOverrideSuccessResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdSandboxApproval-requests']['responses']['201']['content']['application/json'];

export const requestSandboxOverrideHandler = http.post<
  RequestOverridePathParams,
  never,
  RequestOverrideSuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/teams/{teamId}/sandbox/approval-requests',
  ),
  () => {
    return HttpResponse.json(
      {
        responseData: {
          results: {
            approvalRequired: true as const,
            approval: {
              id: 1,
              status: 'pending',
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
              createdAt: new Date().toISOString(),
            },
          },
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);

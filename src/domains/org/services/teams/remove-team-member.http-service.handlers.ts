import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MswPathParams = {
  organizationId: string;
  teamId: string;
  memberUserId: string;
};
type SuccessResponse =
  operations['deleteApiV1ByOrganizationIdTeamsByTeamIdMembersByMemberUserId']['responses']['200']['content']['application/json'];

export const removeTeamMemberHandler = http.delete<
  MswPathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/teams/{teamId}/members/{memberUserId}',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [],
      },
      responseErrors: null,
    });
  },
);

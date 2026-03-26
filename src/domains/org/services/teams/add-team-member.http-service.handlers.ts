import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdMembers']['parameters']['path'];
type RequestBody =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdMembers']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdMembers']['responses']['201']['content']['application/json'];

export const addTeamMemberHandler = http.post<
  PathParams,
  RequestBody,
  SuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'),
  async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        responseData: {
          results: [body.userId],
        },
        responseErrors: null,
      },
      { status: 201 },
    );
  },
);

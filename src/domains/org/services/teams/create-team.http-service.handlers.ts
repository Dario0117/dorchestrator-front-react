import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['postApiV1ByOrganizationIdTeams']['parameters']['path'];
type RequestBody =
  operations['postApiV1ByOrganizationIdTeams']['requestBody']['content']['application/json'];
type SuccessResponse =
  operations['postApiV1ByOrganizationIdTeams']['responses']['201']['content']['application/json'];

export const createTeamHandler = http.post<
  PathParams,
  RequestBody,
  SuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/teams'), async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json(
    {
      responseData: {
        results: {
          id: 'team-123',
          name: body.name,
          slug: body.slug,
          organizationId: 'org-1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
      responseErrors: null,
    },
    { status: 201 },
  );
});

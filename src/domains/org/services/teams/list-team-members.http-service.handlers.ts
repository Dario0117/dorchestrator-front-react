import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type PathParams =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdMembers']['parameters']['path'];
type SuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdMembers']['responses']['200']['content']['application/json'];

export const mockTeamMembers: SuccessResponse['responseData']['results'] = [
  {
    id: 'tm-1',
    userId: 'user-1',
    teamId: 'team-1',
    name: 'Alice Owner',
    email: 'alice@example.com',
    createdAt: '2025-01-01T00:00:00.000Z',
    expiresAt: null,
  },
  {
    id: 'tm-2',
    userId: 'user-2',
    teamId: 'team-1',
    name: 'Bob Member',
    email: 'bob@example.com',
    createdAt: '2025-02-01T00:00:00.000Z',
    expiresAt: '2026-06-01T00:00:00.000Z',
  },
];

export const listTeamMembersHandler = http.get<
  PathParams,
  never,
  SuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/members'), () => {
  return HttpResponse.json({
    responseData: {
      results: mockTeamMembers,
    },
    responseErrors: null,
  });
});

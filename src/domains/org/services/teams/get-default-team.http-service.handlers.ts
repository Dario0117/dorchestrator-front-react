import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SuccessResponse =
  operations['getApiV1OrganizationsDefault-team']['responses']['200']['content']['application/json'];

export const getDefaultTeamHandler = http.get<never, never, SuccessResponse>(
  buildBackendUrl('/api/v1/organizations/default-team'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: 'team-123',
      },
      responseErrors: null,
    });
  },
);

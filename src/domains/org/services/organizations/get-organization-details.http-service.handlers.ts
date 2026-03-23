import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetOrganizationPathParams =
  operations['getApiV1ByOrganizationIdOrganization']['parameters']['path'];
type GetOrganizationSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganization']['responses']['200']['content']['application/json'];

export const getOrganizationDetailsHandler = http.get<
  GetOrganizationPathParams,
  never,
  GetOrganizationSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/organization'), ({ params }) => {
  const { organizationId } = params;

  return HttpResponse.json({
    responseData: {
      results: {
        id: organizationId,
        name: 'Test Organization',
        createdAt: '2025-12-21T10:00:00.000Z',
        memberCount: 1,
        tier: 'free',
        deviceLimit: null,
      },
    },
    responseErrors: null,
  });
});

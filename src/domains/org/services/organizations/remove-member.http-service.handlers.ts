import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type RemoveMemberSuccessResponse =
  operations['deleteApiV1ByOrganizationIdMembersByMemberId']['responses']['200']['content']['application/json'];

type RemoveMemberMswPathParams = {
  organizationId: string;
  memberId: string;
};

export const removeMemberHandler = http.delete<
  RemoveMemberMswPathParams,
  never,
  RemoveMemberSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/members/{memberId}'), () => {
  return HttpResponse.json({
    responseData: {
      results: ['Member removed successfully'],
    },
    responseErrors: null,
  });
});

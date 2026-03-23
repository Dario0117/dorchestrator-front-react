import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type LeaveOrganizationSuccessResponse =
  operations['postApiV1ByOrganizationIdOrganizationLeave']['responses']['200']['content']['application/json'];

type LeaveOrganizationMswPathParams = {
  organizationId: string;
};

export const leaveOrganizationHandler = http.post<
  LeaveOrganizationMswPathParams,
  never,
  LeaveOrganizationSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/organization/leave'), () => {
  return HttpResponse.json({
    responseData: {
      results: ['Successfully left the organization'],
    },
    responseErrors: null,
  });
});

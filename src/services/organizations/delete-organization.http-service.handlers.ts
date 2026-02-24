import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type DeleteOrganizationSuccessResponse =
  operations['deleteApiV1ByOrganizationIdOrganization']['responses']['200']['content']['application/json'];

type DeleteOrganizationMswPathParams = {
  organizationId: string;
};

export const deleteOrganizationHandler = http.delete<
  DeleteOrganizationMswPathParams,
  never,
  DeleteOrganizationSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/organization'), () => {
  return HttpResponse.json({
    responseData: {
      results: ['Organization deleted successfully'],
    },
    responseErrors: null,
  });
});

import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type TransferOwnershipRequestBody =
  operations['postApiV1ByOrganizationIdOrganizationTransfer-ownership']['requestBody']['content']['application/json'];

type TransferOwnershipSuccessResponse =
  operations['postApiV1ByOrganizationIdOrganizationTransfer-ownership']['responses']['200']['content']['application/json'];

type TransferOwnershipMswPathParams = {
  organizationId: string;
};

export const transferOwnershipHandler = http.post<
  TransferOwnershipMswPathParams,
  TransferOwnershipRequestBody,
  TransferOwnershipSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/organization/transfer-ownership'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Ownership transferred successfully'],
      },
      responseErrors: null,
    });
  },
);

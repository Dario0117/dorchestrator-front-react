import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';

export const reviewSandboxApprovalHandler = http.patch<{
  organizationId: string;
  approvalId: string;
}>(
  buildBackendUrl(
    '/api/v1/{organizationId}/sandbox/approval-requests/{approvalId}',
  ),
  () => {
    return HttpResponse.json(null, { status: 204 });
  },
);

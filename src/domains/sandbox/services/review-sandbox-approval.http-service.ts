import { $api } from '@/http-service-setup';

export function useReviewSandboxApprovalMutation() {
  return $api.useMutation(
    'patch',
    '/api/v1/{organizationId}/sandbox/approval-requests/{approvalId}',
  );
}

export type useReviewSandboxApprovalMutationType = ReturnType<
  typeof useReviewSandboxApprovalMutation
>;

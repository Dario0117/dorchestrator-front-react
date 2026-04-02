import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useSandboxApprovalsQueryOptions = (
  organizationId: string,
  params: { page: number; size: number; status?: string },
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/sandbox/approval-requests',
    {
      params: {
        path: { organizationId },
        query: {
          page: params.page,
          size: params.size,
          status: params.status,
        },
      },
    },
  );

export function useSandboxApprovalsSuspenseQuery(
  organizationId: string,
  params: { page: number; size: number; status?: string },
) {
  return useSuspenseQuery(
    useSandboxApprovalsQueryOptions(organizationId, params),
  );
}

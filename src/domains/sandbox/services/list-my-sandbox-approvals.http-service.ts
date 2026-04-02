import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useListMySandboxApprovalsQueryOptions = (
  organizationId: string,
  teamId: string,
  params: { page: number; size: number },
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/teams/{teamId}/sandbox/approval-requests/mine',
    {
      params: {
        path: { organizationId, teamId },
        query: {
          page: params.page,
          size: params.size,
        },
      },
    },
  );

export function useListMySandboxApprovalsSuspenseQuery(
  organizationId: string,
  teamId: string,
  params: { page: number; size: number },
) {
  return useSuspenseQuery(
    useListMySandboxApprovalsQueryOptions(organizationId, teamId, params),
  );
}

export type useListMySandboxApprovalsSuspenseQueryReturnType = ReturnType<
  typeof useListMySandboxApprovalsSuspenseQuery
>;
export type useListMySandboxApprovalsSuspenseQueryData =
  useListMySandboxApprovalsSuspenseQueryReturnType['data'];

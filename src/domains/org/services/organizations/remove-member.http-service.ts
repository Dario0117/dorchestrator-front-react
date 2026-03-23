import { getListMembersQueryKey } from '@domains/org/services/organizations/list-members.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useRemoveMemberMutation() {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/members/{memberId}',
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: getListMembersQueryKey(
            variables.params.path.organizationId,
          ),
        });
      },
    },
  );
}

export type useRemoveMemberMutationType = ReturnType<
  typeof useRemoveMemberMutation
>;

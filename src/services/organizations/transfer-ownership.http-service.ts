import { queryClient } from '@context/query.provider';
import { getListMembersQueryKey } from '@services/organizations/list-members.http-service';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { $api } from '@/http-service-setup';

export function useTransferOwnershipMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/organization/transfer-ownership',
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: getListMembersQueryKey(
            variables.params.path.organizationId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: useUserOrganizationsQueryOptions.queryKey,
        });
      },
    },
  );
}

export type useTransferOwnershipMutationType = ReturnType<
  typeof useTransferOwnershipMutation
>;

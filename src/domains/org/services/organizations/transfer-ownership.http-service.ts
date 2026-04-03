import { getListMembersQueryKey } from '@domains/org/services/organizations/list-members.http-service';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
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

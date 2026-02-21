import { queryClient } from '@context/query.provider';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { $api } from '@/http-service-setup';

export function useSetDefaultOrganizationMutation() {
  return $api.useMutation('put', '/api/v1/organizations/default', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useUserOrganizationsQueryOptions.queryKey,
      });
    },
  });
}

export type useSetDefaultOrganizationMutationType = ReturnType<
  typeof useSetDefaultOrganizationMutation
>;

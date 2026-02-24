import { queryClient } from '@context/query.provider';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { $api } from '@/http-service-setup';

export function useDeleteOrganizationMutation() {
  return $api.useMutation('delete', '/api/v1/{organizationId}/organization', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useUserOrganizationsQueryOptions.queryKey,
      });
    },
  });
}

export type useDeleteOrganizationMutationType = ReturnType<
  typeof useDeleteOrganizationMutation
>;

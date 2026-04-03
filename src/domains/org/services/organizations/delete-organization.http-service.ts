import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
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

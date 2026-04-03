import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
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

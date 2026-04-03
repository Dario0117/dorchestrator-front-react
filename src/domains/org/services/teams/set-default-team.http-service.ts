import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useSetDefaultTeamMutation() {
  return $api.useMutation('put', '/api/v1/organizations/default-team', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get', '/api/v1/organizations/default-team'],
      });
    },
  });
}

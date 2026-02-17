import { queryClient } from '@context/query.provider';
import { $api } from '@/http-service-setup';

export function useSubmitCommandMutation() {
  return $api.useMutation('post', '/api/v1/{organizationId}/commands', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get', '/api/v1/{organizationId}/commands'],
      });
    },
  });
}

export type useSubmitCommandMutationType = ReturnType<
  typeof useSubmitCommandMutation
>;

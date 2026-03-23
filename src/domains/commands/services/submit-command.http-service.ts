import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useSubmitCommandMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/teams/{teamId}/commands',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/api/v1/{organizationId}/teams/{teamId}/commands'],
        });
      },
    },
  );
}

export type useSubmitCommandMutationType = ReturnType<
  typeof useSubmitCommandMutation
>;

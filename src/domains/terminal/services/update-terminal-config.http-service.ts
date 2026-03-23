import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useUpdateTerminalConfigMutation() {
  return $api.useMutation('put', '/api/v1/{organizationId}/terminal/config', {
    onSuccess: (_data, { params }) => {
      const organizationId = params?.path?.organizationId ?? '';
      const { queryKey } = $api.queryOptions(
        'get',
        '/api/v1/{organizationId}/terminal/config',
        { params: { path: { organizationId } } },
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export type useUpdateTerminalConfigMutationType = ReturnType<
  typeof useUpdateTerminalConfigMutation
>;

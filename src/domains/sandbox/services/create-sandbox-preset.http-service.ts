import { useListSandboxPresetsQueryOptions } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useCreateSandboxPresetMutation(organizationId: string) {
  const { queryKey } = useListSandboxPresetsQueryOptions(organizationId);

  return $api.useMutation('post', '/api/v1/{organizationId}/sandbox/presets', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export type useCreateSandboxPresetMutationType = ReturnType<
  typeof useCreateSandboxPresetMutation
>;

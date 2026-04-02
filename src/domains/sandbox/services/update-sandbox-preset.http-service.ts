import { useListSandboxPresetsQueryOptions } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useUpdateSandboxPresetMutation(organizationId: string) {
  const { queryKey } = useListSandboxPresetsQueryOptions(organizationId);

  return $api.useMutation(
    'put',
    '/api/v1/{organizationId}/sandbox/presets/{presetId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
}

export type useUpdateSandboxPresetMutationType = ReturnType<
  typeof useUpdateSandboxPresetMutation
>;

import { useListSandboxPresetsQueryOptions } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useDeleteSandboxPresetMutation(organizationId: string) {
  const { queryKey } = useListSandboxPresetsQueryOptions(organizationId);

  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/sandbox/presets/{presetId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
}

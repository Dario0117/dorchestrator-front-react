import { useListSandboxPresetsQueryOptions } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { $api } from '@/http-service-setup';

export function useSetOrgDefaultPresetMutation(organizationId: string) {
  const { queryKey } = useListSandboxPresetsQueryOptions(organizationId);

  return $api.useMutation(
    'patch',
    '/api/v1/{organizationId}/sandbox/presets/{presetId}/set-default',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
}

export type useSetOrgDefaultPresetMutationType = ReturnType<
  typeof useSetOrgDefaultPresetMutation
>;

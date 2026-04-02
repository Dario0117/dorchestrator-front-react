import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type ListPresetsResponse =
  operations['getApiV1ByOrganizationIdSandboxPresets']['responses']['200']['content']['application/json'];

export type SandboxPresetItem =
  ListPresetsResponse['responseData']['results'][number];

export const useListSandboxPresetsQueryOptions = (organizationId: string) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/sandbox/presets', {
    params: {
      path: { organizationId },
    },
  });

export function useListSandboxPresetsSuspenseQuery(organizationId: string) {
  return useSuspenseQuery(useListSandboxPresetsQueryOptions(organizationId));
}

export type useListSandboxPresetsSuspenseQueryReturnType = ReturnType<
  typeof useListSandboxPresetsSuspenseQuery
>;

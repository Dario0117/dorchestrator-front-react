import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type SandboxTypesResponse =
  operations['getApiV1ByOrganizationIdSandboxTypes']['responses']['200']['content']['application/json'];

export type SandboxTypeItem =
  SandboxTypesResponse['responseData']['results'][number];

const useSandboxTypesQueryOptions = (organizationId: string) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/sandbox/types', {
    params: {
      path: { organizationId },
    },
  });

export function useSandboxTypesSuspenseQuery(organizationId: string) {
  return useSuspenseQuery(useSandboxTypesQueryOptions(organizationId));
}

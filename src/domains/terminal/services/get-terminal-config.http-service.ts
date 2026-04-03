import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useGetTerminalConfigQueryOptions = (organizationId: string) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/terminal/config', {
    params: {
      path: {
        organizationId,
      },
    },
  });

export function useGetTerminalConfigSuspenseQuery(organizationId: string) {
  return useSuspenseQuery(useGetTerminalConfigQueryOptions(organizationId));
}

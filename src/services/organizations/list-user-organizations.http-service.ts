import { useSuspenseQuery } from '@tanstack/react-query';
import { logError } from '@/lib/logger.utils';
import { authClient } from '../../better-auth.client';

export const useUserOrganizationsQueryOptions = {
  queryKey: ['user-organizations'],
  queryFn: async () => {
    const result = await authClient.organization.list();
    if (result.error) {
      logError({
        message: 'Organization list failed',
        error: result.error,
      });
      throw new Error(result.error.message ?? 'Failed to fetch organizations');
    }
    return result.data ?? [];
  },
  staleTime: 60000, // Cache for 1 minute
};

export function useUserOrganizationsSuspendedQuery() {
  return useSuspenseQuery(useUserOrganizationsQueryOptions);
}

export type useUserOrganizationsQueryReturnType = ReturnType<
  typeof useUserOrganizationsSuspendedQuery
>;

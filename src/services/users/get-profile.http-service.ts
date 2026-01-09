import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { authClient } from '../../better-auth.client';

export const profileQueryOptions = {
  queryKey: ['profile'],
  queryFn: async () => {
    const session = await authClient.getSession();
    if (session.data?.user) {
      return session.data.user;
    }
    throw new Error(session.error?.message ?? 'No user found');
  },
  staleTime: Number.POSITIVE_INFINITY,
  retry: false,
};

export function useProfileQuery() {
  return useQuery(profileQueryOptions);
}

export function useProfileSuspendedQuery() {
  return useSuspenseQuery(profileQueryOptions);
}

export type useProfileQueryReturnType = ReturnType<typeof useProfileQuery>;

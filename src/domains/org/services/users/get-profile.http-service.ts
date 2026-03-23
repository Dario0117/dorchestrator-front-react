import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const profileQueryOptions = $api.queryOptions(
  'get',
  '/api/v1/me',
  {},
  {
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  },
);

export function useProfileSuspendedQuery() {
  const query = useSuspenseQuery(profileQueryOptions);
  const profile = query.data.responseData?.results;
  if (!profile) {
    throw new Error('No user found');
  }
  return { ...query, data: profile };
}

export type useProfileQueryReturnType = ReturnType<
  typeof useProfileSuspendedQuery
>;

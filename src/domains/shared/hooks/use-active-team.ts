import { profileQueryOptions } from '@domains/org/services/users/get-profile.http-service';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useActiveTeamId() {
  const { data } = useSuspenseQuery(profileQueryOptions);

  return data.responseData?.results?.activeTeamId ?? null;
}

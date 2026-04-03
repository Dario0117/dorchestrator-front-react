import { queryClient } from '@domains/shared/context/query.provider';
import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

const useListTeamMembersQueryOptions = (
  organizationId: string,
  teamId: string,
) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/teams/{teamId}/members', {
    params: {
      path: { organizationId, teamId },
    },
  });

export function useListTeamMembersSuspenseQuery(
  organizationId: string,
  teamId: string,
) {
  return useSuspenseQuery(
    useListTeamMembersQueryOptions(organizationId, teamId),
  );
}

function getListTeamMembersQueryKey(organizationId: string, teamId: string) {
  return useListTeamMembersQueryOptions(organizationId, teamId).queryKey;
}

export function invalidateTeamMembersQuery(
  organizationId: string,
  teamId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: getListTeamMembersQueryKey(organizationId, teamId),
  });
}

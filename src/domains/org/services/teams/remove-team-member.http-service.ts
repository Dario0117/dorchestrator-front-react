import { invalidateTeamMembersQuery } from '@domains/org/services/teams/list-team-members.http-service';
import { $api } from '@/http-service-setup';

export function useRemoveTeamMemberMutation(
  organizationId: string,
  teamId: string,
) {
  return $api.useMutation(
    'delete',
    '/api/v1/{organizationId}/teams/{teamId}/members/{memberUserId}',
    {
      onSuccess: () => {
        invalidateTeamMembersQuery(organizationId, teamId);
      },
    },
  );
}

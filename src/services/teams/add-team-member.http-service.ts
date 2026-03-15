import { invalidateTeamMembersQuery } from '@services/teams/list-team-members.http-service';
import { $api } from '@/http-service-setup';

export function useAddTeamMemberMutation(
  organizationId: string,
  teamId: string,
) {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/teams/{teamId}/members',
    {
      onSuccess: () => {
        invalidateTeamMembersQuery(organizationId, teamId);
      },
    },
  );
}

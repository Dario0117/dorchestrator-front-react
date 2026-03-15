import { invalidateTeamMembersQuery } from '@services/teams/list-team-members.http-service';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useRemoveTeamMemberMutation(
  organizationId: string,
  teamId: string,
) {
  return useMutation({
    mutationFn: async (params: { userId: string }) => {
      const response = await authClient.organization.removeTeamMember({
        teamId,
        userId: params.userId,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateTeamMembersQuery(organizationId, teamId);
    },
  });
}

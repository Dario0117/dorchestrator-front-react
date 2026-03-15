import { invalidateTeamsQuery } from '@services/teams/list-teams.http-service';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useRemoveTeamMutation(organizationId: string) {
  return useMutation({
    mutationFn: async (params: { teamId: string }) => {
      const response = await authClient.organization.removeTeam({
        teamId: params.teamId,
        organizationId,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateTeamsQuery();
    },
  });
}

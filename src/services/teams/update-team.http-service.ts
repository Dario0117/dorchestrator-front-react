import { invalidateTeamsQuery } from '@services/teams/list-teams.http-service';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useUpdateTeamMutation() {
  return useMutation({
    mutationFn: async (params: { teamId: string; name: string }) => {
      const response = await authClient.organization.updateTeam({
        teamId: params.teamId,
        data: { name: params.name },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateTeamsQuery();
    },
  });
}

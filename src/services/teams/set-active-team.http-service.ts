import { queryClient } from '@context/query.provider';
import { profileQueryOptions } from '@services/users/get-profile.http-service';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/better-auth.client';

export function useSetActiveTeamMutation() {
  return useMutation({
    mutationFn: async (params: { teamId: string | null }) => {
      const response = await authClient.organization.setActiveTeam({
        teamId: params.teamId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryOptions.queryKey,
      });
    },
  });
}

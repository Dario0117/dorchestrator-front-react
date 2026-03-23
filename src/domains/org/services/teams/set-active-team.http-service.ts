import { profileQueryOptions } from '@domains/org/services/users/get-profile.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
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

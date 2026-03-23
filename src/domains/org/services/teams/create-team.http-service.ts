import { invalidateTeamsQuery } from '@domains/org/services/teams/list-teams.http-service';
import { $api } from '@/http-service-setup';

export function useCreateTeamMutation() {
  return $api.useMutation('post', '/api/v1/{organizationId}/teams', {
    onSuccess: () => {
      invalidateTeamsQuery();
    },
  });
}

export type useCreateTeamMutationType = ReturnType<
  typeof useCreateTeamMutation
>;

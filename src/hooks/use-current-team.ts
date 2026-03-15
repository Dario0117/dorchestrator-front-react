import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useParams } from '@tanstack/react-router';
import { _getNullableCurrentTeamFromSlug } from '@/app';

export function useCurrentTeam() {
  const currentOrganization = useCurrentOrganization();
  const params = useParams({ strict: false });

  const teamSlug = 'teamSlug' in params ? params.teamSlug : undefined;

  if (!teamSlug) {
    return undefined;
  }

  return _getNullableCurrentTeamFromSlug(currentOrganization.id, teamSlug);
}

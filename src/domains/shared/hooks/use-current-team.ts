import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useParams } from '@tanstack/react-router';
import { _getNullableCurrentTeamFromSlug } from '@/app';

export function useCurrentTeam() {
  const currentOrganization = useCurrentOrganization();
  const params = useParams({ strict: false });

  const teamSlug = 'teamSlug' in params ? params.teamSlug : undefined;

  if (!teamSlug) {
    return undefined;
  }

  // biome-ignore lint/style/noNonNullAssertion: At this point, team must be defined (validated in route.tsx:beforeLoad)
  return _getNullableCurrentTeamFromSlug(currentOrganization.id, teamSlug)!;
}

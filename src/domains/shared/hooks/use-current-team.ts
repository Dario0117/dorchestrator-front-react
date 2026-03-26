import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useNavigationStore } from '@domains/shared/stores/navigation.store';
import { useParams } from '@tanstack/react-router';
import { _getNullableCurrentTeamFromSlug } from '@/app';

/**
 * Returns the current team from the URL params.
 * Throws if used outside a team-scoped route (`/$organizationSlug/t/$teamSlug`).
 */
export function useCurrentTeam() {
  const currentOrganization = useCurrentOrganization();
  const params = useParams({ strict: false });

  const teamSlug = 'teamSlug' in params ? params.teamSlug : undefined;

  if (!teamSlug) {
    throw new Error(
      'useCurrentTeam must be used within a route with teamSlug param',
    );
  }

  // biome-ignore lint/style/noNonNullAssertion: At this point, team must be defined (validated in route.tsx:beforeLoad)
  return _getNullableCurrentTeamFromSlug(currentOrganization.id, teamSlug)!;
}

/**
 * Returns the active team from the navigation store.
 * Always resolves a team — the org route guarantees a default is set in the store.
 * Use this in components that live outside team-scoped routes (e.g. command palette).
 */
export function useActiveTeam() {
  const currentOrganization = useCurrentOrganization();
  const teamSlug = useNavigationStore(
    (s) => s.teamByOrg[currentOrganization.slug],
  );

  if (!teamSlug) {
    throw new Error(
      'useActiveTeam: no active team found in navigation store. The org route should guarantee a default team is set.',
    );
  }

  // biome-ignore lint/style/noNonNullAssertion: Team must exist — the org route sets a default in the store
  return _getNullableCurrentTeamFromSlug(currentOrganization.id, teamSlug)!;
}

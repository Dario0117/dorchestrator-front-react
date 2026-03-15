import { queryClient } from '@context/query.provider';
import {
  type OrganizationItem,
  useUserOrganizationsQueryOptions,
} from '@services/organizations/list-user-organizations.http-service';

export type TeamItem = OrganizationItem['teams'][number];

/**
 * Get all teams from the cached organizations query.
 * Teams are included in the organizations response — no separate fetch needed.
 */
export function getAllTeamsFromCache(): TeamItem[] {
  const data = queryClient.getQueryData(
    useUserOrganizationsQueryOptions.queryKey,
  ) as { responseData?: { results?: OrganizationItem[] } } | undefined;
  const organizations = data?.responseData?.results ?? [];
  return organizations.flatMap((org) => org.teams);
}

/** Filter cached teams by organization ID */
export function getTeamsForOrg(
  teams: TeamItem[],
  organizationId: string,
): TeamItem[] {
  return teams.filter((t) => t.organizationId === organizationId);
}

export function invalidateTeamsQuery() {
  return queryClient.invalidateQueries({
    queryKey: useUserOrganizationsQueryOptions.queryKey,
  });
}

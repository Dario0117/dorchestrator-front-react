import type { OrganizationItem } from '@services/organizations/list-user-organizations.http-service';
import type { TeamItem } from '@services/teams/list-teams.http-service';
import type { QueryClient } from '@tanstack/react-query';

export interface RouterContext {
  queryClient: QueryClient;
  _getNullableCurrentOrganizationFromSlug: (
    slug: string,
  ) => OrganizationItem | undefined;
  getCurrentOrganizationFromSlug: (slug: string) => OrganizationItem;
  _getNullableCurrentTeamFromSlug: (
    orgId: string,
    teamSlug: string,
  ) => TeamItem | undefined;
  getCurrentTeamFromSlug: (orgId: string, teamSlug: string) => TeamItem;
}

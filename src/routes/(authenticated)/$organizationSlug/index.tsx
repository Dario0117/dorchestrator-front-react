import { useDefaultTeamQueryOptions } from '@domains/org/services/teams/get-default-team.http-service';
import {
  getAllTeamsFromCache,
  getTeamsForOrg,
} from '@domains/org/services/teams/list-teams.http-service';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/$organizationSlug/')({
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );

    const orgTeams = getTeamsForOrg(
      getAllTeamsFromCache(),
      currentOrganization.id,
    );

    // Try to get the user's default team
    let defaultTeamSlug: string | undefined;
    const defaultTeamOptions = useDefaultTeamQueryOptions(
      currentOrganization.id,
    );

    try {
      const defaultTeamData =
        await ctx.context.queryClient.fetchQuery(defaultTeamOptions);
      const defaultTeamId = defaultTeamData?.responseData?.results;

      if (defaultTeamId) {
        const defaultTeam = orgTeams.find((t) => t.id === defaultTeamId);
        defaultTeamSlug = defaultTeam?.slug;
      }
    } catch {
      // No default team set, will fall back
    }

    // Fallback: use first team alphabetically (admins will typically be first)
    if (!defaultTeamSlug) {
      const sorted = [...orgTeams].sort((a, b) => a.slug.localeCompare(b.slug));
      defaultTeamSlug = sorted[0]?.slug;
    }

    if (defaultTeamSlug) {
      throw redirect({
        to: '/$organizationSlug/t/$teamSlug',
        params: {
          organizationSlug: ctx.params.organizationSlug,
          teamSlug: defaultTeamSlug,
        },
        replace: true,
      });
    }
  },
});

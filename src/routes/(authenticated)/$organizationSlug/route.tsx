import { useDefaultTeamQueryOptions } from '@domains/org/services/teams/get-default-team.http-service';
import {
  getAllTeamsFromCache,
  getTeamsForOrg,
} from '@domains/org/services/teams/list-teams.http-service';
import { useNavigationStore } from '@domains/shared/stores/navigation.store';
import { logWarning } from '@lib/logger.utils';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '@/better-auth.client';

function resolveDefaultTeamSlug(
  orgId: string,
  defaultTeamId: string | undefined,
) {
  const orgTeams = getTeamsForOrg(getAllTeamsFromCache(), orgId);

  if (defaultTeamId) {
    const defaultTeam = orgTeams.find((t) => t.id === defaultTeamId);
    if (defaultTeam) {
      return defaultTeam.slug;
    }
  }

  const sorted = [...orgTeams].sort((a, b) => a.slug.localeCompare(b.slug));
  return sorted[0]?.slug;
}

export const Route = createFileRoute('/(authenticated)/$organizationSlug')({
  component: () => <Outlet />,
  beforeLoad: async (ctx) => {
    const currentOrganization =
      ctx.context._getNullableCurrentOrganizationFromSlug(
        ctx.params.organizationSlug,
      );
    if (!currentOrganization) {
      logWarning(
        {
          pathname: window.location.pathname,
          organizationSlug: ctx.params.organizationSlug,
        },
        'Access attempt without a valid organization',
      );
      throw redirect({
        to: '/',
        replace: true,
        search: window.location.search,
      });
    }
    const store = useNavigationStore.getState();
    if (store.activeOrgSlug !== ctx.params.organizationSlug) {
      await authClient.organization.setActive({
        organizationId: currentOrganization.id,
      });
      store.setActiveOrg(ctx.params.organizationSlug);
    }

    const defaultTeamOptions = useDefaultTeamQueryOptions(
      currentOrganization.id,
    );
    if (!store.teamByOrg[ctx.params.organizationSlug]) {
      let defaultTeamId: string | undefined;
      try {
        const defaultTeamData =
          await ctx.context.queryClient.fetchQuery(defaultTeamOptions);
        defaultTeamId = defaultTeamData?.responseData?.results ?? undefined;
      } catch {
        // No default team set, will fall back
      }

      const teamSlug = resolveDefaultTeamSlug(
        currentOrganization.id,
        defaultTeamId,
      );
      if (teamSlug) {
        store.setActiveTeam(ctx.params.organizationSlug, teamSlug);
      }
    }
  },
});

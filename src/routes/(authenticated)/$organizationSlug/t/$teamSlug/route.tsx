import { useNavigationStore } from '@domains/shared/stores/navigation.store';
import { logWarning } from '@lib/logger.utils';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '@/better-auth.client';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug',
)({
  component: () => <Outlet />,
  beforeLoad: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );

    const resolvedTeam = ctx.context._getNullableCurrentTeamFromSlug?.(
      currentOrganization.id,
      ctx.params.teamSlug,
    );

    if (!resolvedTeam) {
      logWarning(
        {
          pathname: window.location.pathname,
          teamSlug: ctx.params.teamSlug,
          organizationSlug: ctx.params.organizationSlug,
        },
        'Access attempt with invalid team slug',
      );
      throw redirect({
        to: '/$organizationSlug',
        params: { organizationSlug: ctx.params.organizationSlug },
        replace: true,
      });
    }

    const store = useNavigationStore.getState();
    if (store.teamByOrg[ctx.params.organizationSlug] !== ctx.params.teamSlug) {
      await authClient.organization.setActiveTeam({
        teamId: resolvedTeam.id,
      });
      store.setActiveTeam(ctx.params.organizationSlug, ctx.params.teamSlug);
    }
  },
});

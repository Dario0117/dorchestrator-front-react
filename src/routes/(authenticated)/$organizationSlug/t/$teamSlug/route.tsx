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

    // Sync the session's active team
    await authClient.organization.setActiveTeam({
      teamId: resolvedTeam.id,
    });
  },
});

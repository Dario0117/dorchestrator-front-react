import { useDevicesQueryOptions } from '@domains/devices/services/list-devices.http-service';
import {
  DASHBOARD_DEVICE_PAGE_SIZE,
  HomePage,
} from '@domains/org/pages/home.page';
import { useOrganizationStatsQueryOptions } from '@domains/org/services/organizations/get-organization-stats.http-service';
import { useTerminalSessionsQueryOptions } from '@domains/terminal/services/list-terminal-sessions.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/',
)({
  component: HomePage,
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    const currentTeam = ctx.context.getCurrentTeamFromSlug(
      currentOrganization.id,
      ctx.params.teamSlug,
    );
    await Promise.all([
      ctx.context.queryClient.ensureQueryData(
        useOrganizationStatsQueryOptions(currentOrganization.id),
      ),
      ctx.context.queryClient.ensureQueryData(
        useDevicesQueryOptions(
          currentOrganization.id,
          currentTeam.id,
          1,
          DASHBOARD_DEVICE_PAGE_SIZE,
        ),
      ),
      ctx.context.queryClient.ensureQueryData(
        useTerminalSessionsQueryOptions(
          currentOrganization.id,
          currentTeam.id,
          {
            status: 'active',
            size: 1,
          },
        ),
      ),
    ]);
  },
});

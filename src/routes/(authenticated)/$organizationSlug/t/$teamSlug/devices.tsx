import { DevicesPage } from '@components/org/pages/devices.page';
import { useDevicesQueryOptions } from '@services/devices/list-devices.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(10).catch(10),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/devices',
)({
  validateSearch: searchParamsSchema,
  component: DevicesPage,
  loaderDeps: ({ search: { page, size } }) => ({
    page,
    size,
  }),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    const currentTeam = ctx.context.getCurrentTeamFromSlug(
      currentOrganization.id,
      ctx.params.teamSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useDevicesQueryOptions(
        currentOrganization.id,
        currentTeam.id,
        ctx.deps.page,
        ctx.deps.size,
      ),
    );
  },
});

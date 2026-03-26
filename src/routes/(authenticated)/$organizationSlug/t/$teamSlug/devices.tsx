import { useDevicesQueryOptions } from '@domains/devices/services/list-devices.http-service';
import {
  DEVICE_PLATFORMS,
  DEVICE_STATUSES,
} from '@domains/devices/services/list-devices.http-service.constants';
import { DevicesPage } from '@domains/org/pages/devices.page';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(25).catch(25),
  status: z.enum(DEVICE_STATUSES).optional().catch(undefined),
  platform: z.enum(DEVICE_PLATFORMS).optional().catch(undefined),
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

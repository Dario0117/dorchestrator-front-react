import { CommandsListPage } from '@domains/commands/pages/commands-list.page';
import { useCommandsQueryOptions } from '@domains/commands/services/list-commands.http-service';
import { COMMAND_STATUSES } from '@domains/commands/services/list-commands.http-service.constants';
import { useDevicesQueryOptions } from '@domains/devices/services/list-devices.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(10).catch(10),
  executeModal: z.literal('open').optional().catch(undefined),
  deviceId: z.coerce.number().int().positive().optional().catch(undefined),
  status: z.enum(COMMAND_STATUSES).optional().catch(undefined),
  startDate: z.string().optional().catch(undefined),
  endDate: z.string().optional().catch(undefined),
  search: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/commands/',
)({
  validateSearch: searchParamsSchema,
  component: CommandsListPage,
  loaderDeps: ({
    search: { page, size, deviceId, status, startDate, endDate, search },
  }) => ({ page, size, deviceId, status, startDate, endDate, search }),
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
        useCommandsQueryOptions(currentOrganization.id, currentTeam.id, {
          page: ctx.deps.page,
          size: ctx.deps.size,
          deviceId: ctx.deps.deviceId,
          status: ctx.deps.status,
          startDate: ctx.deps.startDate,
          endDate: ctx.deps.endDate,
          search: ctx.deps.search,
        }),
      ),
      ctx.context.queryClient.ensureQueryData(
        useDevicesQueryOptions(currentOrganization.id, currentTeam.id, 1, 100),
      ),
    ]);
  },
});

import { CommandsListPage } from '@components/commands/pages/commands-list.page';
import { useCommandsQueryOptions } from '@services/commands/list-commands.http-service';
import { useDevicesQueryOptions } from '@services/devices/list-devices.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(10).catch(10),
  executeModal: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/commands/',
)({
  validateSearch: searchParamsSchema,
  component: CommandsListPage,
  loaderDeps: ({ search: { page, size } }) => ({ page, size }),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await Promise.all([
      ctx.context.queryClient.ensureQueryData(
        useCommandsQueryOptions(
          currentOrganization.id,
          ctx.deps.page,
          ctx.deps.size,
        ),
      ),
      ctx.context.queryClient.ensureQueryData(
        useDevicesQueryOptions(currentOrganization.id, 1, 100),
      ),
    ]);
  },
});

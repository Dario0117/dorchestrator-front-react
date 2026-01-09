import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';
import { DevicesPage } from '@/components/org/pages/devices.page';
import { useDevicesQueryOptions } from '@/services/devices/list-devices.http-service';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(10).catch(10),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/devices',
)({
  validateSearch: searchParamsSchema,
  component: DevicesPage,
  loaderDeps: ({ search: { page, size } }) => ({ page, size }),
  loader: async (ctx) => {
    await Promise.all([
      ctx.context.queryClient.ensureQueryData(
        useDevicesQueryOptions(
          ctx.context.currentOrganization.id,
          ctx.deps.page,
          ctx.deps.size,
        ),
      ),
    ]);
  },
});

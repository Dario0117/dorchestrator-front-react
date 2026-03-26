import { RouteErrorFallback } from '@components/ds/atoms/route-error-fallback';
import { TerminalSessionsPage } from '@domains/terminal/pages/terminal-sessions.page';
import { useTerminalSessionsQueryOptions } from '@domains/terminal/services/list-terminal-sessions.http-service';
import { TERMINAL_SESSION_STATUSES } from '@domains/terminal/services/list-terminal-sessions.http-service.constants';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(25).catch(25),
  status: z.enum(TERMINAL_SESSION_STATUSES).optional().catch(undefined),
  deviceId: z.coerce.number().int().positive().optional().catch(undefined),
  userId: z.string().optional().catch(undefined),
  dateFrom: z.string().optional().catch(undefined),
  dateTo: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/terminal/',
)({
  validateSearch: searchParamsSchema,
  component: TerminalSessionsPage,
  errorComponent: ({ reset }) => (
    <RouteErrorFallback
      reset={reset}
      pageTitle="Terminal Sessions"
      errorTitle="Failed to load sessions"
      errorDescription="Something went wrong while loading terminal sessions."
    />
  ),
  loaderDeps: ({
    search: { page, size, status, deviceId, userId, dateFrom, dateTo },
  }) => ({
    page,
    size,
    status,
    deviceId,
    userId,
    dateFrom,
    dateTo,
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
      useTerminalSessionsQueryOptions(currentOrganization.id, currentTeam.id, {
        page: ctx.deps.page,
        size: ctx.deps.size,
        status: ctx.deps.status,
        deviceId: ctx.deps.deviceId,
        userId: ctx.deps.userId,
        dateFrom: ctx.deps.dateFrom,
        dateTo: ctx.deps.dateTo,
      }),
    );
  },
});

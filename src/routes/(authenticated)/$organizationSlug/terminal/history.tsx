import {
  SessionHistoryPage,
  SessionHistoryTableSkeleton,
} from '@components/terminal/pages/session-history.page';
import { RouteErrorFallback } from '@components/ui/route-error-fallback';
import { useSessionHistoryQueryOptions } from '@services/terminal/list-session-history.http-service';
import { SESSION_HISTORY_STATUSES } from '@services/terminal/list-session-history.http-service.constants';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(25).catch(25),
  status: z.enum(SESSION_HISTORY_STATUSES).optional().catch(undefined),
  deviceId: z.coerce.number().int().positive().optional().catch(undefined),
  userId: z.string().optional().catch(undefined),
  dateFrom: z.string().optional().catch(undefined),
  dateTo: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/terminal/history',
)({
  validateSearch: searchParamsSchema,
  component: SessionHistoryRoute,
  errorComponent: ({ reset }) => (
    <RouteErrorFallback
      reset={reset}
      pageTitle="Session History"
      errorTitle="Failed to load session history"
      errorDescription="Something went wrong while loading session history."
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
    await ctx.context.queryClient.ensureQueryData(
      useSessionHistoryQueryOptions(currentOrganization.id, {
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

function SessionHistoryRoute() {
  return (
    <Suspense
      fallback={
        <section className="p-6 md:p-10 space-y-6">
          <div className="py-6">
            <h1 className="mb-6 text-2xl font-bold font-serif">
              Session History
            </h1>
            <SessionHistoryTableSkeleton />
          </div>
        </section>
      }
    >
      <SessionHistoryPage />
    </Suspense>
  );
}

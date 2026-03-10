import {
  SessionTableSkeleton,
  TerminalSessionsPage,
} from '@components/terminal/pages/terminal-sessions.page';
import { RouteErrorFallback } from '@components/ui/route-error-fallback';
import { useTerminalSessionsQueryOptions } from '@services/terminal/list-terminal-sessions.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod/v4';

const TERMINAL_SESSION_STATUSES = [
  'created',
  'active',
  'locked',
  'terminated',
] as const;

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(25).catch(25),
  status: z.enum(TERMINAL_SESSION_STATUSES).optional().catch(undefined),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/terminal/',
)({
  validateSearch: searchParamsSchema,
  component: TerminalSessionsRoute,
  errorComponent: ({ reset }) => (
    <RouteErrorFallback
      reset={reset}
      pageTitle="Terminal Sessions"
      errorTitle="Failed to load sessions"
      errorDescription="Something went wrong while loading terminal sessions."
    />
  ),
  loaderDeps: ({ search: { page, size, status } }) => ({
    page,
    size,
    status,
  }),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useTerminalSessionsQueryOptions(currentOrganization.id, {
        page: ctx.deps.page,
        size: ctx.deps.size,
        status: ctx.deps.status,
      }),
    );
  },
});

function TerminalSessionsRoute() {
  return (
    <Suspense
      fallback={
        <section className="p-6 md:p-10 space-y-6">
          <div className="py-6">
            <h1 className="mb-6 text-2xl font-bold font-serif">
              Terminal Sessions
            </h1>
            <SessionTableSkeleton />
          </div>
        </section>
      }
    >
      <TerminalSessionsPage />
    </Suspense>
  );
}

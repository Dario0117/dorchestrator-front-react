import { RouteErrorFallback } from '@components/ds/atoms/route-error-fallback';
import { SessionLoadingSkeleton } from '@domains/terminal/components/session-loading-skeleton';
import { TerminalSessionPage } from '@domains/terminal/pages/terminal-session.page';
import { useTerminalSessionQueryOptions } from '@domains/terminal/services/get-terminal-session.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/terminal/$sessionId',
)({
  component: () => (
    <Suspense fallback={<SessionLoadingSkeleton />}>
      <TerminalSessionPage />
    </Suspense>
  ),
  errorComponent: ({ reset }) => (
    <RouteErrorFallback
      reset={reset}
      pageTitle="Terminal Session"
      errorTitle="Failed to load session"
      errorDescription="Something went wrong while loading the terminal session."
    />
  ),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useTerminalSessionQueryOptions(
        currentOrganization.id,
        Number(ctx.params.sessionId),
      ),
    );
  },
});

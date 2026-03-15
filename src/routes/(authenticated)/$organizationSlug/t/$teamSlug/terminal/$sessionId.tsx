import { TerminalSessionPage } from '@components/terminal/pages/terminal-session.page';
import { SessionLoadingSkeleton } from '@components/terminal/session-loading-skeleton';
import { RouteErrorFallback } from '@components/ui/route-error-fallback';
import { useTerminalSessionQueryOptions } from '@services/terminal/get-terminal-session.http-service';
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

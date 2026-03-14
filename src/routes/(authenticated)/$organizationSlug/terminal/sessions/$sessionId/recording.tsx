import { RecordingPlaybackPage } from '@components/terminal/pages/recording-playback.page';
import { RecordingPlaybackSkeleton } from '@components/terminal/pages/recording-playback-skeleton';
import { RouteErrorFallback } from '@components/ui/route-error-fallback';
import { useGetRecordingQueryOptions } from '@services/terminal/get-recording.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/terminal/sessions/$sessionId/recording',
)({
  component: RecordingRoute,
  errorComponent: ({ reset }) => (
    <RouteErrorFallback
      reset={reset}
      pageTitle="Session Recording"
      errorTitle="Failed to load recording"
      errorDescription="Something went wrong while loading the recording."
    />
  ),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useGetRecordingQueryOptions(
        currentOrganization.id,
        Number(ctx.params.sessionId),
      ),
    );
  },
});

function RecordingRoute() {
  return (
    <Suspense fallback={<RecordingPlaybackSkeleton />}>
      <RecordingPlaybackPage />
    </Suspense>
  );
}

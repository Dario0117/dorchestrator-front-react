import { RouteErrorFallback } from '@components/ds/atoms/route-error-fallback';
import { RecordingPlaybackSkeleton } from '@domains/terminal/components/recording-playback-skeleton';
import { RecordingPlaybackPage } from '@domains/terminal/pages/recording-playback.page';
import { useGetRecordingQueryOptions } from '@domains/terminal/services/get-recording.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/terminal/sessions/$sessionId/recording',
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

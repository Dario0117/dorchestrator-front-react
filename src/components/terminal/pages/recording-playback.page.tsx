import {
  FontSizeControls,
  useFontSize,
} from '@components/terminal/font-size-controls';
import { RecordingPlayer } from '@components/terminal/recording-player';
import type { ImageMapping } from '@components/terminal/recording-player.types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import { Skeleton } from '@components/ui/skeleton';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { badgeStyles } from '@lib/badge-styles';
import { formatBytes } from '@lib/format-bytes';
import { formatDurationCompact } from '@lib/format-duration';
import { Route } from '@routes/(authenticated)/$organizationSlug/terminal/sessions/$sessionId/recording';
import {
  type RecordingData,
  useGetRecordingSuspenseQuery,
} from '@services/terminal/get-recording.http-service';
import { useSessionImagesQueryOptions } from '@services/terminal/list-session-images.http-service';
import { useRestoreRecordingMutation } from '@services/terminal/restore-recording.http-service';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileWarning, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

const TIER_BADGE_STYLES = {
  hot: badgeStyles.green,
  cold: badgeStyles.blue,
  restoring: badgeStyles.yellow,
} as const;

function StorageTierBadge({ tier }: { tier: string | null }) {
  const style =
    TIER_BADGE_STYLES[tier as keyof typeof TIER_BADGE_STYLES] ??
    badgeStyles.gray;
  return (
    <Badge
      variant="outline"
      className={style}
    >
      {tier ?? 'unknown'}
    </Badge>
  );
}

function ColdStorageView({
  organizationId,
  sessionId,
}: {
  organizationId: string;
  sessionId: number;
}) {
  const restoreMutation = useRestoreRecordingMutation();

  return (
    <EmptyState
      icon={FileWarning}
      title="Recording archived"
      description="This recording has been moved to cold storage. Restore it to view the playback."
      action={
        <Button
          onClick={() =>
            restoreMutation.mutate({
              params: {
                path: { organizationId, sessionId },
              },
            })
          }
          disabled={restoreMutation.isPending}
        >
          {restoreMutation.isPending ? 'Requesting...' : 'Restore Recording'}
        </Button>
      }
    />
  );
}

function RestoringView() {
  return (
    <EmptyState
      icon={Loader2}
      title="Restoring recording..."
      description="The recording is being restored from cold storage. This may take a few minutes. The page will update automatically."
    />
  );
}

function RecordingContent({
  recording,
  organizationId,
  sessionId,
}: {
  recording: RecordingData;
  organizationId: string;
  sessionId: number;
}) {
  const {
    fontSize,
    increase: increaseFontSize,
    decrease: decreaseFontSize,
  } = useFontSize();

  const { data: imagesData } = useQuery(
    useSessionImagesQueryOptions(organizationId, sessionId),
  );

  const imageMap = useMemo<ImageMapping>(() => {
    const images = imagesData?.responseData?.results ?? [];
    const map: ImageMapping = {};
    for (const img of images) {
      map[img.filename] = img.id;
    }
    return map;
  }, [imagesData]);

  if (recording.recordingStorageTier === 'cold') {
    return (
      <ColdStorageView
        organizationId={organizationId}
        sessionId={sessionId}
      />
    );
  }

  if (recording.recordingStorageTier === 'restoring') {
    return <RestoringView />;
  }

  if (recording.chunks.length === 0) {
    return (
      <EmptyState
        icon={FileWarning}
        title="No recording data"
        description="This session has no recording chunks."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <FontSizeControls
          fontSize={fontSize}
          onIncrease={increaseFontSize}
          onDecrease={decreaseFontSize}
        />
      </div>
      <RecordingPlayer
        chunks={recording.chunks}
        durationSeconds={recording.durationSeconds}
        fontSize={fontSize}
        organizationId={organizationId}
        sessionId={sessionId}
        imageMap={imageMap}
      />
    </div>
  );
}

function RecordingPlaybackPage() {
  const currentOrganization = useCurrentOrganization();
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  const { data } = useGetRecordingSuspenseQuery(
    currentOrganization.id,
    Number(sessionId),
  );

  const recording = data.responseData?.results;

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({
                to: '/$organizationSlug/terminal/history',
                params: { organizationSlug: currentOrganization.slug },
              })
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold font-serif">
            Session Recording — #{sessionId}
          </h1>
          {recording && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <StorageTierBadge tier={recording.recordingStorageTier} />
              <span>{recording.totalChunks} chunks</span>
              <span>{formatBytes(recording.totalSizeBytes)}</span>
              <span>
                {formatDurationCompact(recording.durationSeconds * 1000)}
              </span>
            </div>
          )}
        </div>

        {recording ? (
          <RecordingContent
            recording={recording}
            organizationId={currentOrganization.id}
            sessionId={Number(sessionId)}
          />
        ) : (
          <EmptyState
            icon={FileWarning}
            title="Recording not found"
            description="Could not load the recording for this session."
          />
        )}
      </div>
    </section>
  );
}

function RecordingPlaybackSkeleton() {
  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="py-6">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-[500px] w-full rounded-md" />
        <Skeleton className="mt-4 h-20 w-full rounded-md" />
      </div>
    </section>
  );
}

export { RecordingPlaybackPage, RecordingPlaybackSkeleton };

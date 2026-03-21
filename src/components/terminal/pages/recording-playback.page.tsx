import { PageHeadingBar } from '@components/layout/page-heading-bar';
import { PageSection } from '@components/layout/page-section';
import { SectionTitle } from '@components/layout/section-title';
import { RecordingContent } from '@components/terminal/pages/recording-content';
import { StorageTierBadge } from '@components/terminal/pages/storage-tier-badge';
import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { formatBytes } from '@lib/format-bytes';
import { formatDurationCompact } from '@lib/format-duration';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/sessions/$sessionId/recording';
import { useGetRecordingSuspenseQuery } from '@services/terminal/get-recording.http-service';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileWarning } from 'lucide-react';

function RecordingPlaybackPage() {
  const currentOrganization = useCurrentOrganization();
  const { sessionId, teamSlug } = Route.useParams();
  const navigate = useNavigate();

  const { data } = useGetRecordingSuspenseQuery(
    currentOrganization.id,
    Number(sessionId),
  );

  const recording = data.responseData?.results;

  return (
    <PageSection>
      <div className="py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({
                to: '/$organizationSlug/t/$teamSlug/terminal',
                params: {
                  organizationSlug: currentOrganization.slug,
                  teamSlug,
                },
              })
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
        </div>

        <PageHeadingBar>
          <SectionTitle>Session Recording — #{sessionId}</SectionTitle>
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
        </PageHeadingBar>

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
    </PageSection>
  );
}

export { RecordingPlaybackPage };

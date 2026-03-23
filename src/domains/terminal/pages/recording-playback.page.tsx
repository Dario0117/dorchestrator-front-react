import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { HStack } from '@components/ds/atoms/hstack';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { SmallText } from '@components/ds/atoms/small-text';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { RecordingContent } from '@domains/terminal/components/recording-content';
import { StorageTierBadge } from '@domains/terminal/components/storage-tier-badge';
import { useGetRecordingSuspenseQuery } from '@domains/terminal/services/get-recording.http-service';
import { formatBytes } from '@lib/format-bytes';
import { formatDurationCompact } from '@lib/format-duration';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/sessions/$sessionId/recording';
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
      <Box innerSpaceY="lg">
        <HStack
          gap="lg"
          innerSpaceBelow="xl"
        >
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
        </HStack>

        <PageHeadingBar>
          <SectionTitle>Session Recording — #{sessionId}</SectionTitle>
          {recording && (
            <HStack
              gap="md"
              textSize="sm"
            >
              <StorageTierBadge tier={recording.recordingStorageTier} />
              <SmallText color="muted">
                {recording.totalChunks} chunks
              </SmallText>
              <SmallText color="muted">
                {formatBytes(recording.totalSizeBytes)}
              </SmallText>
              <SmallText color="muted">
                {formatDurationCompact(recording.durationSeconds * 1000)}
              </SmallText>
            </HStack>
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
      </Box>
    </PageSection>
  );
}

export { RecordingPlaybackPage };

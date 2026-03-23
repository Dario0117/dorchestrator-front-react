import { EmptyState } from '@components/ds/atoms/empty-state';
import { HStack } from '@components/ds/atoms/hstack';
import { Stack } from '@components/ds/atoms/stack';
import { ColdStorageView } from '@domains/terminal/components/cold-storage-view';
import { FontSizeControls } from '@domains/terminal/components/font-size-controls';
import { RecordingPlayer } from '@domains/terminal/components/recording-player';
import type { FileMapping } from '@domains/terminal/components/recording-player.types';
import { RestoringView } from '@domains/terminal/components/restoring-view';
import { SessionFilePanel } from '@domains/terminal/components/session-file-panel';
import { useFontSize } from '@domains/terminal/hooks/use-font-size';
import type { RecordingData } from '@domains/terminal/services/get-recording.http-service';
import { RECORDING_STORAGE_TIER } from '@domains/terminal/services/get-recording.http-service.constants';
import { useSessionFilesQueryOptions } from '@domains/terminal/services/list-session-files.http-service';
import { useQuery } from '@tanstack/react-query';
import { FileWarning } from 'lucide-react';
import { useMemo } from 'react';

export function RecordingContent({
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
    useSessionFilesQueryOptions(organizationId, sessionId),
  );

  const fileMap = useMemo<FileMapping>(() => {
    const files = imagesData?.responseData?.results ?? [];
    const map: FileMapping = {};
    for (const file of files) {
      map[file.filename] = file.id;
    }
    return map;
  }, [imagesData]);

  if (recording.recordingStorageTier === RECORDING_STORAGE_TIER.COLD) {
    return (
      <ColdStorageView
        organizationId={organizationId}
        sessionId={sessionId}
      />
    );
  }

  if (recording.recordingStorageTier === RECORDING_STORAGE_TIER.RESTORING) {
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
    <Stack gap="lg">
      <HStack>
        <FontSizeControls
          fontSize={fontSize}
          onIncrease={increaseFontSize}
          onDecrease={decreaseFontSize}
        />
      </HStack>
      <SessionFilePanel
        organizationId={organizationId}
        sessionId={sessionId}
        readOnly
      />
      <RecordingPlayer
        chunks={recording.chunks}
        durationSeconds={recording.durationSeconds}
        fontSize={fontSize}
        organizationId={organizationId}
        sessionId={sessionId}
        fileMap={fileMap}
      />
    </Stack>
  );
}

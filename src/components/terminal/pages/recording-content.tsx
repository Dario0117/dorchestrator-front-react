import { FontSizeControls } from '@components/terminal/font-size-controls';
import { useFontSize } from '@components/terminal/hooks/use-font-size';
import { ColdStorageView } from '@components/terminal/pages/cold-storage-view';
import { RestoringView } from '@components/terminal/pages/restoring-view';
import { RecordingPlayer } from '@components/terminal/recording-player';
import type { FileMapping } from '@components/terminal/recording-player.types';
import { SessionFilePanel } from '@components/terminal/session-file-panel';
import { EmptyState } from '@components/ui/empty-state';
import type { RecordingData } from '@services/terminal/get-recording.http-service';
import { RECORDING_STORAGE_TIER } from '@services/terminal/get-recording.http-service.constants';
import { useSessionFilesQueryOptions } from '@services/terminal/list-session-files.http-service';
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
    <div className="space-y-4">
      <div className="flex items-center">
        <FontSizeControls
          fontSize={fontSize}
          onIncrease={increaseFontSize}
          onDecrease={decreaseFontSize}
        />
      </div>
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
    </div>
  );
}

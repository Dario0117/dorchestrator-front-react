import { env } from '@lib/env.utils';
import { FileIcon, ImageIcon } from 'lucide-react';

interface FileEventData {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  writtenPath: string;
  transferId: string;
}

interface RecordingFileMarkerProps {
  event: FileEventData;
  timestamp: string;
  organizationId: string;
  sessionId: number;
  imageId: number | null;
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RecordingFileMarker({
  event,
  timestamp,
  organizationId,
  sessionId,
  imageId,
}: RecordingFileMarkerProps) {
  const isImage = event.mimeType.startsWith('image/');
  const imageUrl =
    isImage && imageId !== null
      ? `${env.BACKEND_BASE_URL}/api/v1/${organizationId}/terminal/sessions/${sessionId}/images/${imageId}`
      : null;

  return (
    <div
      className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
      data-testid="recording-file-marker"
    >
      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-10 w-10 shrink-0 overflow-hidden rounded border hover:ring-2 hover:ring-primary"
        >
          <img
            src={imageUrl}
            alt={event.filename}
            crossOrigin="use-credentials"
            className="h-full w-full object-cover"
          />
        </a>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-muted">
          {isImage ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{event.filename}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(event.sizeBytes)} &middot; {event.mimeType} &middot;{' '}
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export type { FileEventData };

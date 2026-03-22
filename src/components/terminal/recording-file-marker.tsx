import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { getFileDownloadUrl } from '@services/terminal/get-file-download-url.http-service';
import { DownloadIcon, FileIcon, ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  fileId: number | null;
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
  fileId,
}: RecordingFileMarkerProps) {
  const isImage = event.mimeType.startsWith('image/');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (fileId === null) {
      return;
    }

    getFileDownloadUrl({ organizationId, sessionId, fileId }).then(
      (result) => setDownloadUrl(result.downloadUrl),
      () => setDownloadUrl(null),
    );
  }, [organizationId, sessionId, fileId]);

  return (
    <div
      className="flex items-center gap-3 rounded-md border bg-muted/30 p-2"
      data-testid="recording-file-marker"
    >
      {downloadUrl && isImage ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-10 w-10 shrink-0 overflow-hidden rounded border hover:ring-2 hover:ring-primary"
        >
          <img
            src={downloadUrl}
            alt={event.filename}
            className="h-full w-full object-cover"
          />
        </a>
      ) : downloadUrl ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-muted hover:ring-2 hover:ring-primary"
        >
          <DownloadIcon className="h-4 w-4 text-muted-foreground" />
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
        <SmallParagraph>
          {formatSize(event.sizeBytes)} &middot; {event.mimeType} &middot;{' '}
          {new Date(timestamp).toLocaleTimeString()}
        </SmallParagraph>
      </div>
    </div>
  );
}

export type { FileEventData };

import { Box } from '@components/ds/atoms/box';
import { Center } from '@components/ds/atoms/center';
import { HStack } from '@components/ds/atoms/hstack';
import { Image } from '@components/ds/atoms/image';
import { LinkBox } from '@components/ds/atoms/link-box';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { getFileDownloadUrl } from '@domains/terminal/services/get-file-download-url.http-service';
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
    <HStack
      gap="md"
      border="all"
      rounded="md"
      innerSpaceX="xs"
      innerSpaceY="xs"
      bg="muted/30"
      data-testid="recording-file-marker"
    >
      {downloadUrl && isImage ? (
        <LinkBox
          variant="thumbnail"
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={downloadUrl}
            alt={event.filename}
            fit="cover"
            fullWidth
            fullHeight
          />
        </LinkBox>
      ) : downloadUrl ? (
        <LinkBox
          variant="icon"
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <DownloadIcon className="h-4 w-4 text-muted-foreground" />
        </LinkBox>
      ) : (
        <Center
          size="md"
          shrink={false}
          rounded="sm"
          border="all"
          bg="muted"
        >
          {isImage ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Center>
      )}
      <Box
        minW0
        grow
      >
        <SecondaryParagraph
          weight="medium"
          truncate
        >
          {event.filename}
        </SecondaryParagraph>
        <SmallParagraph>
          {formatSize(event.sizeBytes)} &middot; {event.mimeType} &middot;{' '}
          {new Date(timestamp).toLocaleTimeString()}
        </SmallParagraph>
      </Box>
    </HStack>
  );
}

export type { FileEventData };

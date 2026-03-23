import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { ClickableArea } from '@components/ds/atoms/clickable-area';
import { DownloadLink } from '@components/ds/atoms/download-link';
import { FileThumbOverlay } from '@components/ds/atoms/file-thumb-overlay';
import { HiddenFileInput } from '@components/ds/atoms/hidden-file-input';
import { HStack } from '@components/ds/atoms/hstack';
import { Image } from '@components/ds/atoms/image';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { Surface } from '@components/ds/atoms/surface';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { getFileDownloadUrl } from '@domains/terminal/services/get-file-download-url.http-service';
import type { SessionFileItem } from '@domains/terminal/services/list-session-files.http-service';
import { useSessionFilesQueryOptions } from '@domains/terminal/services/list-session-files.http-service';
import { useUploadSessionFileMutation } from '@domains/terminal/services/upload-session-file.http-service';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  FileIcon,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface SessionFilePanelProps {
  organizationId: string;
  sessionId: number;
  readOnly?: boolean;
}

function isImageMime(mimeType: string) {
  return mimeType.startsWith('image/');
}

export function SessionFilePanel({
  organizationId,
  sessionId,
  readOnly = false,
}: SessionFilePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<SessionFileItem | null>(null);
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<number, string>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryOptions = useSessionFilesQueryOptions(organizationId, sessionId);
  const { data: filesData } = useQuery(queryOptions);
  const files = filesData?.responseData?.results ?? [];

  const uploadMutation = useUploadSessionFileMutation(
    organizationId,
    sessionId,
  );

  const fetchDownloadUrl = useCallback(
    async (fileId: number) => {
      if (thumbnailUrls[fileId]) {
        return thumbnailUrls[fileId];
      }
      const result = await getFileDownloadUrl({
        organizationId,
        sessionId,
        fileId,
      });
      const url = result.downloadUrl;
      setThumbnailUrls((prev) => ({ ...prev, [fileId]: url }));
      return url;
    },
    [organizationId, sessionId, thumbnailUrls],
  );

  const handleUpload = useCallback(
    (file: File) => {
      setUploadError(null);

      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size exceeds 10MB limit');
        return;
      }

      uploadMutation.mutate(
        { organizationId, sessionId, file },
        {
          onSuccess: () => {
            setExpanded(true);
          },
          onError: (error) => {
            /* v8 ignore start -- TanStack Query always passes Error instances to onError */
            setUploadError(
              error instanceof Error ? error.message : 'Upload failed',
            );
            /* v8 ignore stop */
          },
        },
      );
    },
    [organizationId, sessionId, uploadMutation],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        for (const file of files) {
          handleUpload(file);
        }
      }
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      for (const file of e.dataTransfer.files) {
        handleUpload(file);
      }
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleViewFile = useCallback(
    async (file: SessionFileItem) => {
      setViewingFile(file);
      const url = await fetchDownloadUrl(file.id);
      setViewingFileUrl(url);
    },
    [fetchDownloadUrl],
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Surface
        shrink={false}
        border="bottom"
      >
        <HStack
          gap="sm"
          innerSpaceX="xs"
          innerSpaceY="xs"
          bg="muted/30"
          data-testid="file-panel"
        >
          <Button
            variant="ghost"
            size="compact"
            onClick={() => setExpanded(!expanded)}
            data-testid="toggle-file-panel"
          >
            <ImageIcon className="h-3 w-3" />
            Files{files.length > 0 && ` (${files.length})`}
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="compact"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                data-testid="upload-file-btn"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                Upload
              </Button>
              <HiddenFileInput
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                data-testid="file-input"
              />
              {uploadError && (
                <HStack
                  gap="xs"
                  textSize="xs"
                >
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <SmallText color="destructive">{uploadError}</SmallText>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setUploadError(null)}
                    aria-label="Dismiss error"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </HStack>
              )}
            </>
          )}
        </HStack>

        {expanded && (
          <Surface
            aria-label={readOnly ? 'Session files' : 'File upload drop zone'}
            border="bottom"
            innerSpaceX="sm"
            innerSpaceY="sm"
            data-drag-over={!readOnly && isDragOver ? '' : undefined}
            onDrop={readOnly ? undefined : handleDrop}
            onDragOver={readOnly ? undefined : handleDragOver}
            onDragLeave={readOnly ? undefined : handleDragLeave}
            data-testid="file-gallery"
          >
            {files.length === 0 ? (
              <SmallParagraph
                centered
                innerSpaceY="md"
              >
                {readOnly
                  ? 'No files were uploaded during this session.'
                  : 'No files uploaded. Drag and drop or click Upload to add files.'}
              </SmallParagraph>
            ) : (
              <HStack
                gap="sm"
                align="stretch"
                wrap
              >
                {files.map((file) => (
                  <FileThumb
                    key={file.id}
                    file={file}
                    thumbnailUrl={thumbnailUrls[file.id]}
                    onView={() => handleViewFile(file)}
                    onLoadUrl={() => fetchDownloadUrl(file.id)}
                    formatSize={formatSize}
                  />
                ))}
              </HStack>
            )}
          </Surface>
        )}
      </Surface>

      <Dialog
        open={viewingFile != null}
        onOpenChange={(open) => {
          /* v8 ignore start -- controlled Dialog never fires onOpenChange(true) */
          if (!open) {
            /* v8 ignore stop */
            setViewingFile(null);
            setViewingFileUrl(null);
          }
        }}
      >
        <DialogContent size="wide">
          <DialogHeader>
            <DialogTitle>{viewingFile?.filename}</DialogTitle>
          </DialogHeader>
          {viewingFile && (
            <Stack gap="sm">
              {viewingFileUrl && isImageMime(viewingFile.mimeType) ? (
                <Image
                  src={viewingFileUrl}
                  alt={viewingFile.filename}
                  fit="contain"
                  fullWidth
                />
              ) : (
                <Center innerSpaceY="xl">
                  <FileIcon className="h-16 w-16 text-muted-foreground" />
                </Center>
              )}
              <HStack
                gap="lg"
                align="stretch"
                textSize="xs"
              >
                <SmallText color="muted">{viewingFile.mimeType}</SmallText>
                <SmallText color="muted">
                  {formatSize(viewingFile.sizeBytes)}
                </SmallText>
                <SmallText color="muted">
                  {new Date(viewingFile.createdAt).toLocaleString()}
                </SmallText>
              </HStack>
              {viewingFileUrl && (
                <DownloadLink
                  href={viewingFileUrl}
                  download={viewingFile.filename}
                >
                  Download
                </DownloadLink>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FileThumb({
  file,
  thumbnailUrl,
  onView,
  onLoadUrl,
  formatSize,
}: {
  file: SessionFileItem;
  thumbnailUrl: string | undefined;
  onView: () => void;
  onLoadUrl: () => void;
  formatSize: (bytes: number) => string;
}) {
  const isImage = isImageMime(file.mimeType);

  // Lazy-load thumbnail URL when component mounts
  if (isImage && !thumbnailUrl) {
    onLoadUrl();
  }

  return (
    <ClickableArea
      size="md"
      onClick={onView}
      data-testid={`file-thumb-${file.id}`}
    >
      {isImage && thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={file.filename}
          fit="cover"
          fullHeight
          fullWidth
        />
      ) : (
        <Center
          fullHeight
          fullWidth
          bg="muted"
        >
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        </Center>
      )}
      <FileThumbOverlay data-slot="file-size">
        {formatSize(file.sizeBytes)}
      </FileThumbOverlay>
    </ClickableArea>
  );
}

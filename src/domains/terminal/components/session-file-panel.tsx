import { Button } from '@components/ds/atoms/button';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
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
      <div
        className="flex items-center gap-2 bg-muted/30 px-2 py-1"
        data-testid="file-panel"
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
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
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
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
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              data-testid="file-input"
            />
            {uploadError && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {uploadError}
                <button
                  type="button"
                  className="ml-1"
                  onClick={() => setUploadError(null)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {expanded && (
        <section
          aria-label={readOnly ? 'Session files' : 'File upload drop zone'}
          className={`border-b p-2 ${!readOnly && isDragOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : ''}`}
          onDrop={readOnly ? undefined : handleDrop}
          onDragOver={readOnly ? undefined : handleDragOver}
          onDragLeave={readOnly ? undefined : handleDragLeave}
          data-testid="file-gallery"
        >
          {files.length === 0 ? (
            <SmallParagraph className="py-4 text-center">
              {readOnly
                ? 'No files were uploaded during this session.'
                : 'No files uploaded. Drag and drop or click Upload to add files.'}
            </SmallParagraph>
          ) : (
            <div className="flex flex-wrap gap-2">
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
            </div>
          )}
        </section>
      )}

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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingFile?.filename}</DialogTitle>
          </DialogHeader>
          {viewingFile && (
            <div className="space-y-2">
              {viewingFileUrl && isImageMime(viewingFile.mimeType) ? (
                <img
                  src={viewingFileUrl}
                  alt={viewingFile.filename}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <FileIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{viewingFile.mimeType}</span>
                <span>{formatSize(viewingFile.sizeBytes)}</span>
                <span>{new Date(viewingFile.createdAt).toLocaleString()}</span>
              </div>
              {viewingFileUrl && (
                <a
                  href={viewingFileUrl}
                  download={viewingFile.filename}
                  className="text-xs text-primary hover:underline"
                >
                  Download
                </a>
              )}
            </div>
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
    <button
      type="button"
      className="group relative h-16 w-16 overflow-hidden rounded border hover:ring-2 hover:ring-primary"
      onClick={onView}
      data-testid={`file-thumb-${file.id}`}
    >
      {isImage && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={file.filename}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
        {formatSize(file.sizeBytes)}
      </div>
    </button>
  );
}

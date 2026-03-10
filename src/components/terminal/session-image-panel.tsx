import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { env } from '@lib/env.utils';
import type { SessionImageItem } from '@services/terminal/list-session-images.http-service';
import { useSessionImagesQueryOptions } from '@services/terminal/list-session-images.http-service';
import { useUploadSessionImageMutation } from '@services/terminal/upload-session-image.http-service';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  AlertTriangle,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface SessionImagePanelProps {
  organizationId: string;
  sessionId: number;
}

export function SessionImagePanel({
  organizationId,
  sessionId,
}: SessionImagePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transferWarning, setTransferWarning] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<SessionImageItem | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryOptions = useSessionImagesQueryOptions(organizationId, sessionId);
  const { data: imagesData } = useQuery(queryOptions);
  const images = imagesData?.responseData?.results ?? [];

  const uploadMutation = useUploadSessionImageMutation(
    organizationId,
    sessionId,
  );

  const handleUpload = useCallback(
    (file: File) => {
      setUploadError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError('Invalid file type. Supported: JPEG, PNG, GIF, WebP');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size exceeds 10MB limit');
        return;
      }

      uploadMutation.mutate(
        { organizationId, sessionId, file },
        {
          onSuccess: (data) => {
            setExpanded(true);
            if (!data.responseData.results.transferredToDevice) {
              setTransferWarning(
                'Image saved but agent is offline — file not transferred to device',
              );
            } else {
              setTransferWarning(null);
            }
          },
          onError: (error) => {
            setUploadError(
              error instanceof Error ? error.message : 'Upload failed',
            );
          },
        },
      );
    },
    [organizationId, sessionId, uploadMutation],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
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
      const file = e.dataTransfer.files[0];
      if (file) {
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

  const getImageUrl = (image: SessionImageItem) =>
    `${env.BACKEND_BASE_URL}/api/v1/${organizationId}/terminal/sessions/${sessionId}/images/${image.id}`;

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
        data-testid="image-panel"
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => setExpanded(!expanded)}
          data-testid="toggle-image-panel"
        >
          <ImageIcon className="h-3 w-3" />
          Images{images.length > 0 && ` (${images.length})`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          data-testid="upload-image-btn"
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
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          data-testid="image-file-input"
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
        {transferWarning && !uploadError && (
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            {transferWarning}
            <button
              type="button"
              className="ml-1"
              onClick={() => setTransferWarning(null)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <section
          aria-label="Image upload drop zone"
          className={`border-b p-2 ${isDragOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="image-gallery"
        >
          {images.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No images uploaded. Drag and drop or click Upload to add images.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  className="group relative h-16 w-16 overflow-hidden rounded border hover:ring-2 hover:ring-primary"
                  onClick={() => setViewingImage(image)}
                  data-testid={`image-thumb-${image.id}`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={image.filename}
                    crossOrigin="use-credentials"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {formatSize(image.sizeBytes)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <Dialog
        open={viewingImage != null}
        onOpenChange={(open) => {
          if (!open) {
            setViewingImage(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingImage?.filename}</DialogTitle>
          </DialogHeader>
          {viewingImage && (
            <div className="space-y-2">
              <img
                src={getImageUrl(viewingImage)}
                alt={viewingImage.filename}
                crossOrigin="use-credentials"
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{viewingImage.mimeType}</span>
                <span>{formatSize(viewingImage.sizeBytes)}</span>
                <span>{new Date(viewingImage.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

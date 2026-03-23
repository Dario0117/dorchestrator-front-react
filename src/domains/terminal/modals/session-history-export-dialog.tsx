import { Button } from '@components/ds/atoms/button';
import { Label } from '@components/ds/atoms/label';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import {
  downloadExportFile,
  useCancelExportMutation,
  useExportStatusQueryOptions,
  useInitiateExportMutation,
  usePauseExportMutation,
  useResumeExportMutation,
} from '@domains/terminal/services/export-session-history.http-service';
import { logError } from '@lib/logger.utils';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, Pause, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { operations } from '@/types/api.generated.types';

type ExportSessionStatus =
  operations['postApiV1ByOrganizationIdTerminalSessionsExport']['requestBody']['content']['application/json']['status'];

const POLL_INTERVAL_MS = 2000;

interface SessionHistoryExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  filters: {
    status?: ExportSessionStatus;
    deviceId?: number;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function SessionHistoryExportDialog({
  open,
  onOpenChange,
  organizationId,
  filters,
}: SessionHistoryExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exportId, setExportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const downloadTriggeredRef = useRef(false);

  const initiateMutation = useInitiateExportMutation();
  const pauseMutation = usePauseExportMutation();
  const resumeMutation = useResumeExportMutation();
  const cancelMutation = useCancelExportMutation();

  const statusQueryOptions = useExportStatusQueryOptions(
    organizationId,
    exportId,
  );
  const { data: statusData, refetch: refetchStatus } = useQuery({
    ...statusQueryOptions,
    enabled: exportId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.responseData?.results?.status;
      if (
        status === 'completed' ||
        status === 'failed' ||
        status === 'paused' ||
        status === 'cancelled'
      ) {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
  });

  const exportStatus = statusData?.responseData?.results;
  const currentStatus = exportStatus?.status;
  const isExporting =
    currentStatus === 'pending' ||
    currentStatus === 'processing' ||
    currentStatus === 'pause_requested' ||
    currentStatus === 'cancel_requested';
  const isPaused = currentStatus === 'paused';
  const isCancelled = currentStatus === 'cancelled';
  const totalRows = exportStatus?.totalRows ?? 0;
  const rowsProcessed = exportStatus?.rowsProcessed ?? 0;
  const progress =
    totalRows > 0 ? Math.round((rowsProcessed / totalRows) * 100) : 0;

  // Handle completed/failed status
  useEffect(() => {
    if (!exportStatus || !exportId) {
      return;
    }

    if (exportStatus.status === 'completed' && !downloadTriggeredRef.current) {
      downloadTriggeredRef.current = true;
      downloadExportFile(organizationId, exportId)
        .then(() => onOpenChange(false))
        .catch((err) => {
          logError({ error: err }, 'Failed to download export file');
          setError('Download failed. Please try again.');
        });
    }

    if (exportStatus.status === 'failed') {
      setError(exportStatus.errorMessage ?? 'Export failed. Please try again.');
    }
  }, [exportStatus, exportId, organizationId, onOpenChange]);

  const { reset: resetInitiateMutation } = initiateMutation;
  const { reset: resetPauseMutation } = pauseMutation;
  const { reset: resetResumeMutation } = resumeMutation;
  const { reset: resetCancelMutation } = cancelMutation;
  useEffect(() => {
    if (!open) {
      setExportId(null);
      setError(null);
      downloadTriggeredRef.current = false;
      resetInitiateMutation();
      resetPauseMutation();
      resetResumeMutation();
      resetCancelMutation();
    }
  }, [
    open,
    resetInitiateMutation,
    resetPauseMutation,
    resetResumeMutation,
    resetCancelMutation,
  ]);

  const handleExport = () => {
    setError(null);
    downloadTriggeredRef.current = false;
    initiateMutation.mutate(
      {
        params: { path: { organizationId } },
        body: {
          format,
          ...filters,
        },
      },
      {
        onSuccess: (data) => {
          setExportId(data.responseData.results.exportId);
        },
        onError: (err) => {
          logError({ error: err }, 'Session history export initiation failed');
          setError('Failed to start export. Please try again.');
        },
      },
    );
  };

  const handleRetry = () => {
    setExportId(null);
    setError(null);
    downloadTriggeredRef.current = false;
    initiateMutation.reset();
  };

  const handlePause = () => {
    pauseMutation.mutate(
      { params: { path: { organizationId, exportId: exportId as string } } },
      {
        onSuccess: () => refetchStatus(),
        onError: (err) => {
          logError({ error: err }, 'Failed to pause export');
          setError('Failed to pause export.');
        },
      },
    );
  };

  const handleResume = () => {
    resumeMutation.mutate(
      { params: { path: { organizationId, exportId: exportId as string } } },
      {
        onSuccess: () => refetchStatus(),
        onError: (err) => {
          logError({ error: err }, 'Failed to resume export');
          setError('Failed to resume export.');
        },
      },
    );
  };

  const handleCancel = () => {
    cancelMutation.mutate(
      { params: { path: { organizationId, exportId: exportId as string } } },
      {
        onSuccess: () => refetchStatus(),
        onError: (err) => {
          logError({ error: err }, 'Failed to cancel export');
          setError('Failed to cancel export.');
        },
      },
    );
  };

  const hasFilters =
    filters.status ||
    filters.deviceId !== undefined ||
    filters.userId ||
    filters.dateFrom ||
    filters.dateTo;

  const isFailed = currentStatus === 'failed';
  const isActionPending =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Session History</DialogTitle>
          <DialogDescription>
            Download session metadata as a file.
            {hasFilters
              ? ' Current page filters will be applied to the export.'
              : ' All sessions will be included.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!exportId && (
            <div className="grid gap-2">
              <Label htmlFor="export-format">Format</Label>
              <Select
                value={format}
                onValueChange={(val) => setFormat(val as 'csv' | 'json')}
              >
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <SecondaryParagraph>
                {format === 'csv'
                  ? 'Comma-separated values, compatible with Excel and Google Sheets.'
                  : 'Structured JSON format for programmatic use.'}
              </SecondaryParagraph>
            </div>
          )}

          {(isExporting || isPaused) && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                {isPaused ? (
                  <Pause className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <span className="text-sm">
                  {currentStatus === 'pending'
                    ? 'Starting export...'
                    : currentStatus === 'pause_requested'
                      ? 'Pausing...'
                      : currentStatus === 'cancel_requested'
                        ? 'Cancelling...'
                        : isPaused
                          ? `Paused at ${progress}%`
                          : `Exporting... ${progress}%`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <SmallParagraph>
                {rowsProcessed} of {totalRows} rows processed
              </SmallParagraph>
            </div>
          )}

          {isCancelled && (
            <SecondaryParagraph>
              Export was cancelled. {rowsProcessed} of {totalRows} rows were
              processed.
            </SecondaryParagraph>
          )}

          {error && (
            <p
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          {isExporting && (
            <>
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={
                  isActionPending ||
                  currentStatus === 'pause_requested' ||
                  currentStatus === 'cancel_requested'
                }
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={
                  isActionPending || currentStatus === 'cancel_requested'
                }
              >
                <X className="mr-2 h-4 w-4" />
                Cancel export
              </Button>
            </>
          )}
          {isPaused && (
            <>
              <Button
                variant="outline"
                onClick={handleResume}
                disabled={isActionPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isActionPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel export
              </Button>
            </>
          )}
          {(isFailed || isCancelled) && (
            <Button onClick={handleRetry}>Retry</Button>
          )}
          {!exportId && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={initiateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={initiateMutation.isPending}
              >
                {initiateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

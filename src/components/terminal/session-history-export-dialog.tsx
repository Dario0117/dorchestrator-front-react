import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { logError } from '@lib/logger.utils';
import {
  downloadExportFile,
  useExportStatusQueryOptions,
  useInitiateExportMutation,
} from '@services/terminal/export-session-history.http-service';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2 } from 'lucide-react';
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

  const statusQueryOptions = useExportStatusQueryOptions(
    organizationId,
    exportId,
  );
  const { data: statusData } = useQuery({
    ...statusQueryOptions,
    enabled: exportId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.responseData?.results?.status;
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
  });

  const exportStatus = statusData?.responseData?.results;
  const isExporting =
    exportStatus?.status === 'pending' || exportStatus?.status === 'processing';
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
      downloadExportFile(organizationId, exportId, exportStatus.filename)
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

  const { reset: resetMutation } = initiateMutation;
  useEffect(() => {
    if (!open) {
      setExportId(null);
      setError(null);
      downloadTriggeredRef.current = false;
      resetMutation();
    }
  }, [open, resetMutation]);

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

  const hasFilters =
    filters.status ||
    filters.deviceId !== undefined ||
    filters.userId ||
    filters.dateFrom ||
    filters.dateTo;

  const isFailed = exportStatus?.status === 'failed';

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
              <p className="text-sm text-muted-foreground">
                {format === 'csv'
                  ? 'Comma-separated values, compatible with Excel and Google Sheets.'
                  : 'Structured JSON format for programmatic use.'}
              </p>
            </div>
          )}

          {isExporting && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {exportStatus?.status === 'pending'
                    ? 'Starting export...'
                    : `Exporting... ${progress}%`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {rowsProcessed} of {totalRows} rows processed
              </p>
            </div>
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={initiateMutation.isPending}
          >
            Cancel
          </Button>
          {isFailed ? (
            <Button onClick={handleRetry}>Retry</Button>
          ) : (
            <Button
              onClick={handleExport}
              disabled={initiateMutation.isPending || isExporting}
            >
              {initiateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

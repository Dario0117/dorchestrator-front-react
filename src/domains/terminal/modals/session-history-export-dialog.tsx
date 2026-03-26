import { Button } from '@components/ds/atoms/button';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { Label } from '@components/ds/atoms/label';
import { ProgressBar } from '@components/ds/atoms/progress-bar';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ds/atoms/select';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ds/molecules/dialog';
import { useSessionHistoryExport } from '@domains/terminal/hooks/use-session-history-export';
import { Download, Loader2, Pause, Play, X } from 'lucide-react';
import type { operations } from '@/types/api.generated.types';

type ExportSessionStatus =
  operations['postApiV1ByOrganizationIdTerminalSessionsExport']['requestBody']['content']['application/json']['status'];

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
  const {
    format,
    setFormat,
    exportId,
    error,
    currentStatus,
    isExporting,
    isPaused,
    isCancelled,
    isFailed,
    totalRows,
    rowsProcessed,
    progress,
    hasFilters,
    isActionPending,
    isInitiating,
    handleExport,
    handleRetry,
    handlePause,
    handleResume,
    handleCancel,
  } = useSessionHistoryExport({ open, onOpenChange, organizationId, filters });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Session History</DialogTitle>
          <DialogDescription>
            Download session metadata as a file.
            {hasFilters
              ? ' Current page filters will be applied to the export.'
              : ' All sessions will be included.'}
          </DialogDescription>
        </DialogHeader>

        <Grid
          gap="lg"
          innerSpaceY="md"
        >
          {!exportId && (
            <Grid gap="sm">
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
            </Grid>
          )}

          {(isExporting || isPaused) && (
            <Grid gap="sm">
              <HStack gap="sm">
                {isPaused ? (
                  <Pause className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <SmallText
                  color="muted"
                  size="sm"
                >
                  {currentStatus === 'pending'
                    ? 'Starting export...'
                    : currentStatus === 'pause_requested'
                      ? 'Pausing...'
                      : currentStatus === 'cancel_requested'
                        ? 'Cancelling...'
                        : isPaused
                          ? `Paused at ${progress}%`
                          : `Exporting... ${progress}%`}
                </SmallText>
              </HStack>
              <ProgressBar value={progress} />
              <SmallParagraph>
                {rowsProcessed} of {totalRows} rows processed
              </SmallParagraph>
            </Grid>
          )}

          {isCancelled && (
            <SecondaryParagraph>
              Export was cancelled. {rowsProcessed} of {totalRows} rows were
              processed.
            </SecondaryParagraph>
          )}

          {error && (
            <SecondaryParagraph
              color="destructive"
              role="alert"
            >
              {error}
            </SecondaryParagraph>
          )}
        </Grid>

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
                disabled={isInitiating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isInitiating}
              >
                {isInitiating ? (
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

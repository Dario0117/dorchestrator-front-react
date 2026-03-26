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
import { useEffect, useRef, useState } from 'react';
import type { operations } from '@/types/api.generated.types';

type ExportSessionStatus =
  operations['postApiV1ByOrganizationIdTerminalSessionsExport']['requestBody']['content']['application/json']['status'];

const POLL_INTERVAL_MS = 2000;

interface UseSessionHistoryExportOptions {
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

export function useSessionHistoryExport({
  open,
  onOpenChange,
  organizationId,
  filters,
}: UseSessionHistoryExportOptions) {
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
  const isFailed = currentStatus === 'failed';
  const totalRows = exportStatus?.totalRows ?? 0;
  const rowsProcessed = exportStatus?.rowsProcessed ?? 0;
  const progress =
    totalRows > 0 ? Math.round((rowsProcessed / totalRows) * 100) : 0;

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

  const isActionPending =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    cancelMutation.isPending;

  return {
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
    isInitiating: initiateMutation.isPending,
    handleExport,
    handleRetry,
    handlePause,
    handleResume,
    handleCancel,
  };
}

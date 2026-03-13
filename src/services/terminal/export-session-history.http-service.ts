import { $api, fetchClient } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type ExportStatusResult =
  operations['getApiV1ByOrganizationIdTerminalSessionsExportByExportIdStatus']['responses']['200']['content']['application/json']['responseData']['results'];

export type { ExportStatusResult };

export function useInitiateExportMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/export',
  );
}

export function usePauseExportMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/pause',
  );
}

export function useResumeExportMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/resume',
  );
}

export function useCancelExportMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/cancel',
  );
}

export const useExportStatusQueryOptions = (
  organizationId: string,
  exportId: string | null,
) => {
  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/status',
    {
      params: {
        path: { organizationId, exportId: exportId ?? '' },
      },
    },
  );
};

export async function downloadExportFile(
  organizationId: string,
  exportId: string,
  filename: string,
) {
  const { data, error } = await fetchClient.GET(
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/download',
    {
      params: {
        path: { organizationId, exportId },
      },
      parseAs: 'blob',
    },
  );

  if (error) {
    throw new Error('Export download failed');
  }

  const blobUrl = URL.createObjectURL(data);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

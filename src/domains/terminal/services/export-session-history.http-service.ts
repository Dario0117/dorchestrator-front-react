import { $api, fetchClient } from '@/http-service-setup';

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
) {
  const { data, error } = await fetchClient.GET(
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/download',
    {
      params: {
        path: { organizationId, exportId },
      },
    },
  );

  if (error) {
    throw new Error('Export download failed');
  }

  const { downloadUrl, filename } = data.responseData.results;

  const response = await fetch(downloadUrl);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

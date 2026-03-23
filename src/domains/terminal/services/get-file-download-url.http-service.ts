import { fetchClient } from '@/http-service-setup';

interface GetFileDownloadUrlParams {
  organizationId: string;
  sessionId: number;
  fileId: number;
}

export async function getFileDownloadUrl({
  organizationId,
  sessionId,
  fileId,
}: GetFileDownloadUrlParams) {
  const { data, error } = await fetchClient.GET(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/{fileId}/download-url',
    {
      params: { path: { organizationId, sessionId, fileId } },
    },
  );

  if (error) {
    throw error;
  }

  return data.responseData.results;
}

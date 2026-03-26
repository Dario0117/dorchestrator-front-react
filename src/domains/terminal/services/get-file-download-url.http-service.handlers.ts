import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MswPathParams = {
  organizationId: string;
  sessionId: string;
  fileId: string;
};
type SuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdFilesByFileIdDownload-url']['responses']['200']['content']['application/json'];

export const getFileDownloadUrlHandler = http.get<
  MswPathParams,
  never,
  SuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files/{fileId}/download-url',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          downloadUrl: 'https://example.com/download/file.txt',
          expiresInSeconds: 3600,
        },
      },
      responseErrors: null,
    });
  },
);

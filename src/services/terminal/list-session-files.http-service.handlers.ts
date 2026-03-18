import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListSessionFilesResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdFiles']['responses']['200']['content']['application/json'];

type ListSessionFilesMswPathParams = {
  organizationId: string;
  sessionId: string;
};

export const listSessionFilesHandler = http.get<
  ListSessionFilesMswPathParams,
  never,
  ListSessionFilesResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
  ),
  () => {
    return HttpResponse.json({
      responseData: {
        results: [
          {
            id: 1,
            sessionId: 1,
            filename: 'screenshot.png',
            mimeType: 'image/png',
            sizeBytes: 204800,
            createdAt: new Date().toISOString(),
          },
        ],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  },
);

import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetRecordingPathParams = { organizationId: string; sessionId: string };
type GetRecordingSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdRecording']['responses']['200']['content']['application/json'];

const mockChunks: GetRecordingSuccessResponse['responseData']['results']['chunks'] =
  [
    {
      sequenceNumber: 0,
      events: [
        {
          type: 'output',
          data: '\x1b[32muser@host\x1b[0m:\x1b[34m~\x1b[0m$ ',
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 60000).toISOString(),
      sizeBytes: 32,
    },
    {
      sequenceNumber: 1,
      events: [
        {
          type: 'input',
          data: 'ls -la\r\n',
          timestamp: new Date(Date.now() - 59500).toISOString(),
        },
        {
          type: 'output',
          data: 'ls -la\r\n',
          timestamp: new Date(Date.now() - 59000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 59000).toISOString(),
      sizeBytes: 16,
    },
    {
      sequenceNumber: 2,
      events: [
        {
          type: 'output',
          data: 'total 0\r\ndrwxr-xr-x  2 user user 40 Jan  1 00:00 .\r\ndrwxr-xr-x  3 user user 60 Jan  1 00:00 ..\r\n',
          timestamp: new Date(Date.now() - 58500).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 58500).toISOString(),
      sizeBytes: 96,
    },
    {
      sequenceNumber: 3,
      events: [
        {
          type: 'output',
          data: '\x1b[32muser@host\x1b[0m:\x1b[34m~\x1b[0m$ ',
          timestamp: new Date(Date.now() - 58000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 58000).toISOString(),
      sizeBytes: 32,
    },
  ];

export const getRecordingHandler = http.get<
  GetRecordingPathParams,
  never,
  GetRecordingSuccessResponse
>(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/recording',
  ),
  ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const size = Number.parseInt(url.searchParams.get('size') ?? '100', 10);

    const startIndex = (page - 1) * size;
    const chunks = mockChunks.slice(startIndex, startIndex + size);

    return HttpResponse.json({
      responseData: {
        results: {
          chunks,
          totalChunks: mockChunks.length,
          totalSizeBytes: 168,
          durationSeconds: 60,
          recordingStorageTier: 'hot',
        },
      },
      responseErrors: null,
    });
  },
);

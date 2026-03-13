import { env } from '@lib/env.utils';
import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';

const BASE = env.BACKEND_BASE_URL;

export const initiateExportHandler = http.post(
  buildBackendUrl('/api/v1/{organizationId}/terminal/sessions/export'),
  () => {
    return HttpResponse.json(
      {
        responseData: {
          results: { exportId: 'test-export-id' },
        },
        responseErrors: null,
      },
      { status: 202 },
    );
  },
);

export const getExportStatusHandler = http.get(
  `${BASE}/api/v1/:organizationId/terminal/sessions/export/:exportId/status`,
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          exportId: 'test-export-id',
          status: 'completed',
          totalRows: 10,
          rowsProcessed: 10,
          filename: 'session-history-2026-01-01.csv',
          errorMessage: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          completedAt: '2026-01-01T00:00:05.000Z',
        },
      },
      responseErrors: null,
    });
  },
);

export const downloadExportHandler = http.get(
  `${BASE}/api/v1/:organizationId/terminal/sessions/export/:exportId/download`,
  () => {
    return new HttpResponse(
      'session_id,user_email,user_name,device_name,device_id,created_at,terminated_at,duration_seconds,status,recording_size_bytes\n',
      {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition':
            'attachment; filename="session-history-2026-01-01.csv"',
        },
      },
    );
  },
);

const actionResponse = {
  responseData: {
    results: ['OK'],
  },
  responseErrors: null,
};

export const pauseExportHandler = http.post(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/pause',
  ),
  () => HttpResponse.json(actionResponse),
);

export const resumeExportHandler = http.post(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/resume',
  ),
  () => HttpResponse.json(actionResponse),
);

export const cancelExportHandler = http.post(
  buildBackendUrl(
    '/api/v1/{organizationId}/terminal/sessions/export/{exportId}/cancel',
  ),
  () => HttpResponse.json(actionResponse),
);

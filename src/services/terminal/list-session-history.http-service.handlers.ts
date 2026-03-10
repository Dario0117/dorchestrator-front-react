import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type SessionHistoryPathParams =
  operations['getApiV1ByOrganizationIdTerminalSessionsHistory']['parameters']['path'];
type SessionHistorySuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsHistory']['responses']['200']['content']['application/json'];
type SessionHistoryResultItem = NonNullable<
  SessionHistorySuccessResponse['responseData']
>['results'][0];

const mockHistorySessions: SessionHistoryResultItem[] = [
  {
    id: 1,
    status: 'active',
    userId: 'user-1',
    userName: 'Alice',
    userEmail: 'alice@example.com',
    deviceId: 1,
    deviceName: 'Production Server',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    terminatedAt: null,
    durationSeconds: 3600,
    recordingSizeBytes: 102400,
  },
  {
    id: 2,
    status: 'terminated',
    userId: 'user-2',
    userName: 'Bob',
    userEmail: 'bob@example.com',
    deviceId: 2,
    deviceName: 'Dev Laptop',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    terminatedAt: new Date(Date.now() - 82800000).toISOString(),
    durationSeconds: 3600,
    recordingSizeBytes: 204800,
  },
  {
    id: 3,
    status: 'locked',
    userId: 'user-1',
    userName: 'Alice',
    userEmail: 'alice@example.com',
    deviceId: 1,
    deviceName: 'Production Server',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    terminatedAt: null,
    durationSeconds: 7200,
    recordingSizeBytes: 51200,
  },
];

export const listSessionHistoryHandler = http.get<
  SessionHistoryPathParams,
  never,
  SessionHistorySuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/sessions/history'),
  ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const size = Number.parseInt(url.searchParams.get('size') ?? '25', 10);
    const status = url.searchParams.get('status');
    const deviceId = url.searchParams.get('deviceId');
    const userId = url.searchParams.get('userId');

    let filtered = [...mockHistorySessions];

    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    if (deviceId) {
      filtered = filtered.filter((s) => s.deviceId === Number(deviceId));
    }

    if (userId) {
      filtered = filtered.filter((s) => s.userId === userId);
    }

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / size);
    const startIndex = (page - 1) * size;
    const results = filtered.slice(startIndex, startIndex + size);

    return HttpResponse.json({
      responseData: {
        results,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        totalResults,
        totalPages,
        page,
        size,
      },
      responseErrors: null,
    });
  },
);

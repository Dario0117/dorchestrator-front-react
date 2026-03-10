import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListTerminalSessionsPathParams =
  operations['getApiV1ByOrganizationIdTerminalSessions']['parameters']['path'];
type ListTerminalSessionsSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessions']['responses']['200']['content']['application/json'];
type TerminalSessionListItem = NonNullable<
  ListTerminalSessionsSuccessResponse['responseData']
>['results'][0];

const mockSessions: TerminalSessionListItem[] = [
  {
    id: 1,
    deviceId: 1,
    deviceName: 'Production Server',
    userId: 'user-1',
    userName: 'Alice',
    status: 'active',
    shell: '/bin/bash',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastActivityAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 2,
    deviceId: 2,
    deviceName: 'Dev Laptop',
    userId: 'user-2',
    userName: 'Bob',
    status: 'active',
    shell: '/bin/zsh',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastActivityAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 3,
    deviceId: 1,
    deviceName: 'Production Server',
    userId: 'user-1',
    userName: 'Alice',
    status: 'terminated',
    shell: '/bin/bash',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const listTerminalSessionsHandler = http.get<
  ListTerminalSessionsPathParams,
  never,
  ListTerminalSessionsSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'),
  ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const size = Number.parseInt(url.searchParams.get('size') ?? '25', 10);
    const status = url.searchParams.get('status');

    let filtered = [...mockSessions];

    if (status) {
      filtered = filtered.filter((session) => session.status === status);
    } else {
      filtered = filtered.filter((session) => session.status !== 'terminated');
    }

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const results = filtered.slice(startIndex, endIndex);

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

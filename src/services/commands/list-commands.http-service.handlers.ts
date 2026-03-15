import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListCommandsPathParams =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdCommands']['parameters']['path'];
type ListCommandsSuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdCommands']['responses']['200']['content']['application/json'];
type ListCommandsCommand = NonNullable<
  ListCommandsSuccessResponse['responseData']
>['results'][0];

interface MockCommand extends ListCommandsCommand {
  deviceId: number;
}

const mockCommands: MockCommand[] = [
  {
    id: 1,
    deviceId: 1,
    command: 'echo "hello world"',
    status: 'completed',
    deviceName: 'Test Server',
    userEmail: 'admin@example.com',
    platform: 'linux',
    duration: '17s',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    deviceId: 2,
    command: 'systemctl restart nginx',
    status: 'running',
    deviceName: 'Dev Laptop',
    userEmail: 'dev@example.com',
    platform: 'linux',
    duration: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    deviceId: 3,
    command: 'apt update && apt upgrade -y',
    status: 'pending',
    deviceName: 'Build Agent',
    userEmail: 'ci@example.com',
    platform: 'linux',
    duration: null,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 4,
    deviceId: 1,
    command: 'docker compose down --volumes',
    status: 'failed',
    deviceName: 'Test Server',
    userEmail: 'admin@example.com',
    platform: 'darwin',
    duration: '2m 30s',
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
];

export const listCommandsHandler = http.get<
  ListCommandsPathParams,
  never,
  ListCommandsSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
  ({ request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
    const size = Number.parseInt(url.searchParams.get('size') ?? '25', 10);
    const deviceId = url.searchParams.get('deviceId');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');

    let filtered = [...mockCommands];

    if (deviceId) {
      filtered = filtered.filter((c) => String(c.deviceId) === deviceId);
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (startDate) {
      filtered = filtered.filter((c) => c.createdAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((c) => c.createdAt <= endDate);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((c) =>
        c.command.toLowerCase().includes(lowerSearch),
      );
    }

    const totalResults = filtered.length;
    const totalPages = Math.ceil(totalResults / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const results = filtered
      .slice(startIndex, endIndex)
      .map(({ deviceId: _, ...rest }) => rest);

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

import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListCommandsPathParams =
  operations['getApiV1ByOrganizationIdCommands']['parameters']['path'];
type ListCommandsSuccessResponse =
  operations['getApiV1ByOrganizationIdCommands']['responses']['200']['content']['application/json'];
type ListCommandsCommand = NonNullable<
  ListCommandsSuccessResponse['responseData']
>['results'][0];

const mockCommands: ListCommandsCommand[] = [
  {
    id: 1,
    command: 'echo "hello world"',
    status: 'completed',
    deviceName: 'Test Server',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    command: 'systemctl restart nginx',
    status: 'running',
    deviceName: 'Dev Laptop',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    command: 'apt update && apt upgrade -y',
    status: 'pending',
    deviceName: 'Build Agent',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 4,
    command: 'docker compose down --volumes',
    status: 'failed',
    deviceName: 'Test Server',
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
];

export const listCommandsHandler = http.get<
  ListCommandsPathParams,
  never,
  ListCommandsSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/commands'), ({ request }) => {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const size = Number.parseInt(url.searchParams.get('size') ?? '10', 10);

  const totalResults = mockCommands.length;
  const totalPages = Math.ceil(totalResults / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const results = mockCommands.slice(startIndex, endIndex);

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
});

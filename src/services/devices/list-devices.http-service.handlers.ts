import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListDevicesPathParams =
  operations['getApiV1ByOrganizationIdDevices']['parameters']['path'];
type ListDevicesSuccessResponse =
  operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
type ListDevicesDevice = NonNullable<
  ListDevicesSuccessResponse['responseData']
>['results'][0];

const mockDevices: ListDevicesDevice[] = [
  {
    id: 1,
    deviceName: 'Test Server',
    platform: 'linux',
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    deviceName: 'Dev Laptop',
    platform: 'macos',
    lastSeenAt: new Date(Date.now() - 60000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 3,
    deviceName: 'Build Agent',
    platform: 'windows',
    lastSeenAt: null,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 4,
    deviceName: 'Test Device 4',
    platform: 'linux',
    lastSeenAt: new Date(Date.now() - 120000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 5,
    deviceName: 'Test Device 5',
    platform: 'macos',
    lastSeenAt: null,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

export const listDevicesHandler = http.get<
  ListDevicesPathParams,
  never,
  ListDevicesSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/devices'), ({ request }) => {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const size = Number.parseInt(url.searchParams.get('size') ?? '10', 10);

  const totalResults = mockDevices.length;
  const totalPages = Math.ceil(totalResults / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const results = mockDevices.slice(startIndex, endIndex);

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

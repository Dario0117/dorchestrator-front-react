import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type ListNotificationsPathParams =
  operations['getApiV1ByOrganizationIdNotifications']['parameters']['path'];
type ListNotificationsSuccessResponse =
  operations['getApiV1ByOrganizationIdNotifications']['responses']['200']['content']['application/json'];
type NotificationEntry = NonNullable<
  ListNotificationsSuccessResponse['responseData']
>['results'][0];

const mockNotifications: NotificationEntry[] = [
  {
    id: 1,
    message: 'Command completed on Production Server',
    resourceId: '101',
    resourceType: 'command',
    severity: 'success',
    read: false,
    createdAt: new Date(Date.now() - 120000).toISOString(), // 2 min ago
  },
  {
    id: 2,
    message: 'Command failed on Staging Server',
    resourceId: '102',
    resourceType: 'command',
    severity: 'error',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 3,
    message: 'Command completed on Production Server',
    resourceId: '103',
    resourceType: 'command',
    severity: 'success',
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 4,
    message: 'Command failed on CI Runner',
    resourceId: '104',
    resourceType: 'command',
    severity: 'error',
    read: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
  },
  {
    id: 5,
    message: 'Command completed on Backup Server',
    resourceId: '105',
    resourceType: 'command',
    severity: 'success',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

export const listNotificationsHandler = http.get<
  ListNotificationsPathParams,
  never,
  ListNotificationsSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/notifications'), ({ request }) => {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const size = Number.parseInt(url.searchParams.get('size') ?? '10', 10);

  const totalResults = mockNotifications.length;
  const totalPages = Math.ceil(totalResults / size);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const results = mockNotifications.slice(startIndex, endIndex);

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

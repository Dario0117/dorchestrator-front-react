import { $api } from '@/http-service-setup';

export const getUnreadCountQueryOptions = (organizationId: string) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/notifications/unread-count',
    {
      params: {
        path: { organizationId },
      },
    },
  );

import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

const NOTIFICATIONS_PAGE = 1;
const NOTIFICATIONS_SIZE = 10;

export const getNotificationsQueryOptions = (organizationId: string) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/notifications', {
    params: {
      path: { organizationId },
      query: { page: NOTIFICATIONS_PAGE, size: NOTIFICATIONS_SIZE },
    },
  });

export function useNotificationsSuspenseQuery(
  organizationId: string,
  params: { page?: number; size?: number } = {},
) {
  const { page = NOTIFICATIONS_PAGE, size = NOTIFICATIONS_SIZE } = params;

  return useSuspenseQuery(
    $api.queryOptions('get', '/api/v1/{organizationId}/notifications', {
      params: {
        path: { organizationId },
        query: { page, size },
      },
    }),
  );
}

type useNotificationsSuspenseQueryReturnType = ReturnType<
  typeof useNotificationsSuspenseQuery
>;
type useNotificationsSuspenseQueryData =
  useNotificationsSuspenseQueryReturnType['data'];
export type useNotificationsSuspenseQueryResponseData = NonNullable<
  NonNullable<useNotificationsSuspenseQueryData>['responseData']
>;
export type NotificationEntry =
  NonNullable<useNotificationsSuspenseQueryResponseData>['results'][0];

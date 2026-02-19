import { queryClient } from '@context/query.provider';
import { getUnreadCountQueryOptions } from '@services/notifications/get-unread-count.http-service';
import { getNotificationsQueryOptions } from '@services/notifications/list-notifications.http-service';
import { $api } from '@/http-service-setup';

function invalidateNotificationQueries(organizationId: string) {
  const { queryKey: listQueryKey } =
    getNotificationsQueryOptions(organizationId);
  const { queryKey: countQueryKey } =
    getUnreadCountQueryOptions(organizationId);
  queryClient.invalidateQueries({ queryKey: listQueryKey });
  queryClient.invalidateQueries({ queryKey: countQueryKey });
}

export function useMarkNotificationReadMutation() {
  return $api.useMutation(
    'patch',
    '/api/v1/{organizationId}/notifications/{notificationId}',
    {
      onSuccess: (_data, variables) => {
        invalidateNotificationQueries(variables.params.path.organizationId);
      },
    },
  );
}

export function useMarkAllNotificationsReadMutation() {
  return $api.useMutation('patch', '/api/v1/{organizationId}/notifications', {
    onSuccess: (_data, variables) => {
      invalidateNotificationQueries(variables.params.path.organizationId);
    },
  });
}

export type useMarkNotificationReadMutationType = ReturnType<
  typeof useMarkNotificationReadMutation
>;
export type useMarkAllNotificationsReadMutationType = ReturnType<
  typeof useMarkAllNotificationsReadMutation
>;

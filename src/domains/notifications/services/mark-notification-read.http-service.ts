import { getUnreadCountQueryOptions } from '@domains/notifications/services/get-unread-count.http-service';
import { getNotificationsQueryOptions } from '@domains/notifications/services/list-notifications.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
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

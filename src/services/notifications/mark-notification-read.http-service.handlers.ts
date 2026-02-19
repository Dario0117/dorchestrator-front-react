import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type MarkNotificationReadSuccessResponse =
  operations['patchApiV1ByOrganizationIdNotificationsByNotificationId']['responses']['200']['content']['application/json'];

type MarkAllNotificationsReadSuccessResponse =
  operations['patchApiV1ByOrganizationIdNotifications']['responses']['200']['content']['application/json'];

// MSW path params are always strings
type MarkNotificationReadMswPathParams = {
  organizationId: string;
  notificationId: string;
};

type MarkAllNotificationsReadMswPathParams = {
  organizationId: string;
};

export const markNotificationReadHandler = http.patch<
  MarkNotificationReadMswPathParams,
  never,
  MarkNotificationReadSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/notifications/{notificationId}'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: ['Notification marked as read'],
      },
      responseErrors: null,
    });
  },
);

export const markAllNotificationsReadHandler = http.patch<
  MarkAllNotificationsReadMswPathParams,
  never,
  MarkAllNotificationsReadSuccessResponse
>(buildBackendUrl('/api/v1/{organizationId}/notifications'), () => {
  return HttpResponse.json({
    responseData: {
      results: ['All notifications marked as read'],
    },
    responseErrors: null,
  });
});

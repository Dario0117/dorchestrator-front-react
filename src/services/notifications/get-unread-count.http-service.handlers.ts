import { buildBackendUrl } from '@lib/test.utils';
import { HttpResponse, http } from 'msw';
import type { operations } from '@/types/api.generated.types';

type GetUnreadCountPathParams =
  operations['getApiV1ByOrganizationIdNotificationsUnread-count']['parameters']['path'];
type GetUnreadCountSuccessResponse =
  operations['getApiV1ByOrganizationIdNotificationsUnread-count']['responses']['200']['content']['application/json'];

export const getUnreadCountHandler = http.get<
  GetUnreadCountPathParams,
  never,
  GetUnreadCountSuccessResponse
>(
  buildBackendUrl('/api/v1/{organizationId}/notifications/unread-count'),
  () => {
    return HttpResponse.json({
      responseData: {
        results: {
          count: 3,
        },
      },
      responseErrors: null,
    });
  },
);

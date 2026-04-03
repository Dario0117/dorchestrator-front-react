import { $api } from '@/http-service-setup';

export const useGetDeviceConfigQueryOptions = (
  organizationId: string,
  deviceId: number,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/config/{deviceId}',
    {
      params: {
        path: {
          organizationId,
          deviceId,
        },
      },
    },
  );

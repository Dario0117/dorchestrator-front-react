import { $api } from '@/http-service-setup';

export const useGetEffectiveCeilingQueryOptions = (
  organizationId: string,
  deviceId: number,
) =>
  $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
    {
      params: {
        path: {
          organizationId,
          deviceId,
        },
      },
    },
  );

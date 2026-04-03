import { useQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export function useResolveShareLinkQuery(
  organizationId: string,
  shareToken: string,
) {
  return useQuery(
    $api.queryOptions(
      'get',
      '/api/v1/{organizationId}/terminal/shared/{shareToken}',
      {
        params: {
          path: { organizationId, shareToken },
        },
      },
    ),
  );
}

import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type ListSessionImagesOperation =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdImages'];

type ListSessionImagesResponse =
  ListSessionImagesOperation['responses']['200']['content']['application/json'];

type SessionImageItem = ListSessionImagesResponse['responseData']['results'][0];

export type { SessionImageItem };

export const useSessionImagesQueryOptions = (
  organizationId: string,
  sessionId: number,
) => {
  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/images',
    {
      params: {
        query: { page: 1, size: 100 },
        path: { organizationId, sessionId },
      },
    },
  );
};

import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type ListSessionFilesOperation =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionIdFiles'];

type ListSessionFilesResponse =
  ListSessionFilesOperation['responses']['200']['content']['application/json'];

type SessionFileItem = ListSessionFilesResponse['responseData']['results'][0];

export type { SessionFileItem };

export const useSessionFilesQueryOptions = (
  organizationId: string,
  sessionId: number,
) => {
  return $api.queryOptions(
    'get',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/files',
    {
      params: {
        query: { page: 1, size: 100 },
        path: { organizationId, sessionId },
      },
    },
  );
};

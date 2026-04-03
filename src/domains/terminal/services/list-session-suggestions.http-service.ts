import { $api } from '@/http-service-setup';

export function useListSessionSuggestionsQuery(
  organizationId: string,
  sessionId: number,
  enabled = true,
) {
  return $api.useQuery(
    'get',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
    {
      params: {
        path: { organizationId, sessionId },
        query: { page: 1, size: 100 },
      },
    },
    { enabled },
  );
}

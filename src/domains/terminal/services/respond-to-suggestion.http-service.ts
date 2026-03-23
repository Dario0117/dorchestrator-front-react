import { $api } from '@/http-service-setup';

export function useRespondToSuggestionMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions/{suggestionId}/respond',
  );
}

export type useRespondToSuggestionMutationType = ReturnType<
  typeof useRespondToSuggestionMutation
>;

import { $api } from '@/http-service-setup';

export function useCreateTerminalSessionMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
  );
}

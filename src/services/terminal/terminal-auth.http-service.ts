import { $api } from '@/http-service-setup';

export function useTerminalAuthMutation() {
  return $api.useMutation('post', '/api/v1/{organizationId}/terminal/auth');
}

export type useTerminalAuthMutationType = ReturnType<
  typeof useTerminalAuthMutation
>;

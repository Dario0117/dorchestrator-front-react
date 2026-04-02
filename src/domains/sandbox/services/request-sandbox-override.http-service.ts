import { $api } from '@/http-service-setup';

export function useRequestSandboxOverrideMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/teams/{teamId}/sandbox/approval-requests',
  );
}

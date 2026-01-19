import { $api } from '@/http-service-setup';

export function useGenerateTokenMutation() {
  return $api.useMutation('post', '/api/v1/{organizationId}/devices');
}

export type useGenerateTokenMutationType = ReturnType<
  typeof useGenerateTokenMutation
>;

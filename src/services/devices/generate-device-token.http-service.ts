import { $api } from '@/http-service-setup';

export function useGenerateTokenMutation() {
  return $api.useMutation('post', '/api/v1/{organizationId}/devices', {
    onSuccess(data, variables, context) {
      console.log('onSuccess', data);
      console.log('variables', variables);
      console.log('context', context);
    },
  });
}

export type useGenerateTokenMutationType = ReturnType<
  typeof useGenerateTokenMutation
>;

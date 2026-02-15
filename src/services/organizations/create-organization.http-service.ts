import { $api } from '@/http-service-setup';

export function useCreateOrganizationMutation() {
  return $api.useMutation('post', '/api/v1/organizations');
}

export type useCreateOrganizationMutationType = ReturnType<
  typeof useCreateOrganizationMutation
>;

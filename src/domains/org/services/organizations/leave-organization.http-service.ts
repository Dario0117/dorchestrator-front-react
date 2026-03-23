import { $api } from '@/http-service-setup';

export function useLeaveOrganizationMutation() {
  return $api.useMutation(
    'post',
    '/api/v1/{organizationId}/organization/leave',
  );
}

export type useLeaveOrganizationMutationType = ReturnType<
  typeof useLeaveOrganizationMutation
>;

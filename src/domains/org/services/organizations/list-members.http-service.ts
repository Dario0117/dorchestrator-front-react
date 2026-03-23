import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type MembersQuery =
  operations['getApiV1ByOrganizationIdMembers']['parameters']['query'];

export interface MembersQueryParams {
  page?: number;
  size?: number;
  search?: string;
  role?: MembersQuery['role'];
}

export const useListMembersQueryOptions = (
  organizationId: string,
  params: MembersQueryParams = {},
) => {
  const { page = 1, size = 10, search, role } = params;

  return $api.queryOptions('get', '/api/v1/{organizationId}/members', {
    params: {
      path: { organizationId },
      query: { page, size, search, role },
    },
  });
};

export function getListMembersQueryKey(
  organizationId: string,
  params: MembersQueryParams = {},
) {
  return useListMembersQueryOptions(organizationId, params).queryKey;
}

export function useListMembersSuspenseQuery(
  organizationId: string,
  params: MembersQueryParams = {},
) {
  return useSuspenseQuery(useListMembersQueryOptions(organizationId, params));
}

export type useListMembersSuspenseQueryReturnType = ReturnType<
  typeof useListMembersSuspenseQuery
>;

export type ListMembersMember = NonNullable<
  NonNullable<useListMembersSuspenseQueryReturnType['data']['responseData']>
>['results'][0];

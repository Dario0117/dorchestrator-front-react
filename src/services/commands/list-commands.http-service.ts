import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';

export const useCommandsQueryOptions = (
  organizationId: string,
  page = 1,
  size = 25,
) =>
  $api.queryOptions('get', '/api/v1/{organizationId}/commands', {
    params: {
      path: {
        organizationId: organizationId,
      },
      query: {
        page: page,
        size: size,
      },
    },
  });

export function useCommandsSuspenseQuery(
  organizationId: string,
  page = 1,
  size = 25,
) {
  return useSuspenseQuery(useCommandsQueryOptions(organizationId, page, size));
}

export type useCommandsSuspenseQueryReturnType = ReturnType<
  typeof useCommandsSuspenseQuery
>;
export type useCommandsSuspenseQueryData =
  useCommandsSuspenseQueryReturnType['data'];
export type useCommandsSuspenseQueryResponseData = NonNullable<
  NonNullable<useCommandsSuspenseQueryData>['responseData']
>;
export type ListCommandsCommand =
  NonNullable<useCommandsSuspenseQueryResponseData>['results'][0];

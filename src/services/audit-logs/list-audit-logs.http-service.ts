import { useSuspenseQuery } from '@tanstack/react-query';
import { $api } from '@/http-service-setup';
import type { operations } from '@/types/api.generated.types';

type AuditLogsQuery =
  operations['getApiV1ByOrganizationIdAudit-logs']['parameters']['query'];

export interface AuditLogsQueryParams {
  page?: number;
  size?: number;
  action?: AuditLogsQuery['action'];
  resourceType?: AuditLogsQuery['resourceType'];
  fromDate?: string;
  toDate?: string;
}

export const useAuditLogsQueryOptions = (
  organizationId: string,
  params: AuditLogsQueryParams = {},
) => {
  const {
    page = 1,
    size = 25,
    action,
    resourceType,
    fromDate,
    toDate,
  } = params;

  return $api.queryOptions('get', '/api/v1/{organizationId}/audit-logs', {
    params: {
      path: {
        organizationId: organizationId,
      },
      query: {
        page,
        size,
        action,
        resourceType,
        fromDate,
        toDate,
      },
    },
  });
};

export function useAuditLogsSuspenseQuery(
  organizationId: string,
  params: AuditLogsQueryParams = {},
) {
  return useSuspenseQuery(useAuditLogsQueryOptions(organizationId, params));
}

export type useAuditLogsSuspenseQueryReturnType = ReturnType<
  typeof useAuditLogsSuspenseQuery
>;
export type useAuditLogsSuspenseQueryData =
  useAuditLogsSuspenseQueryReturnType['data'];
export type useAuditLogsSuspenseQueryResponseData = NonNullable<
  NonNullable<useAuditLogsSuspenseQueryData>['responseData']
>;
export type AuditLogEntry =
  NonNullable<useAuditLogsSuspenseQueryResponseData>['results'][0];

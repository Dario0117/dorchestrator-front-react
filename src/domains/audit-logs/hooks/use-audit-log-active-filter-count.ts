import { Route } from '@routes/(authenticated)/$organizationSlug/audit-logs/index';

export function useAuditLogActiveFilterCount() {
  const { action, resourceType, fromDate, toDate } = Route.useSearch();
  let count = 0;
  if (action !== undefined) {
    count++;
  }
  if (resourceType !== undefined) {
    count++;
  }
  if (fromDate !== undefined || toDate !== undefined) {
    count++;
  }
  return count;
}

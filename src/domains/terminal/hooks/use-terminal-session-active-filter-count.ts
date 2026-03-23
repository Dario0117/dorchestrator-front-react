import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index';

export function useTerminalSessionActiveFilterCount() {
  const { status, deviceId, userId, dateFrom, dateTo } = Route.useSearch();
  let count = 0;
  if (status !== undefined) {
    count++;
  }
  if (deviceId !== undefined) {
    count++;
  }
  if (userId !== undefined) {
    count++;
  }
  if (dateFrom !== undefined || dateTo !== undefined) {
    count++;
  }
  return count;
}

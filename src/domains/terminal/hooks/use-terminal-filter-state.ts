import type { FilterChip } from '@components/ds/molecules/filter-chips';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index';
import { useNavigate } from '@tanstack/react-router';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'created', label: 'Created' },
  { value: 'locked', label: 'Locked' },
  { value: 'terminated', label: 'Terminated' },
];

export function useTerminalFilterState() {
  const { status, deviceId, userId, dateFrom } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const activeFilterCount = [status, deviceId, userId, dateFrom].filter(
    (v) => v !== undefined,
  ).length;

  const navigateFilter = (updates: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
    });
  };

  const clearFilters = () => {
    navigate({
      search: (prev) => ({
        page: 1,
        size: prev.size,
      }),
    });
  };

  const removeFilter = (key: string) => {
    if (key === 'dateFrom') {
      navigateFilter({ dateFrom: undefined, dateTo: undefined });
    } else {
      navigateFilter({ [key]: undefined });
    }
  };

  const chips: FilterChip[] = [];
  if (status !== undefined) {
    const label =
      STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
    chips.push({ key: 'status', label: 'Status', value: label });
  }
  if (deviceId !== undefined) {
    chips.push({
      key: 'deviceId',
      label: 'Device',
      value: String(deviceId),
    });
  }
  if (userId !== undefined) {
    chips.push({ key: 'userId', label: 'User', value: userId });
  }
  if (dateFrom !== undefined) {
    chips.push({ key: 'dateFrom', label: 'Date', value: 'Custom range' });
  }

  return {
    activeFilterCount,
    chips,
    clearFilters,
    removeFilter,
    navigateFilter,
  };
}

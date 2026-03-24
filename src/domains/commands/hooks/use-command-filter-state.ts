import type { FilterChip } from '@components/ds/molecules/filter-chips';
import type { CommandStatus } from '@domains/commands/services/list-commands.http-service.constants';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index';
import { useNavigate } from '@tanstack/react-router';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const satisfies readonly { value: CommandStatus; label: string }[];

export function useCommandFilterState() {
  const { deviceId, status, startDate, search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const activeFilterCount = [deviceId, status, startDate, search].filter(
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
    if (key === 'startDate') {
      navigateFilter({ startDate: undefined, endDate: undefined });
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
  if (startDate !== undefined) {
    chips.push({ key: 'startDate', label: 'Date', value: 'Custom range' });
  }
  if (search !== undefined) {
    chips.push({ key: 'search', label: 'Search', value: search });
  }

  return {
    activeFilterCount,
    chips,
    clearFilters,
    removeFilter,
    navigateFilter,
    search,
  };
}

import type { FilterChip } from '@components/ds/molecules/filter-chips';
import { AUDIT_LOG_RESOURCE_TYPE_LABELS } from '@domains/audit-logs/services/list-audit-logs.http-service.constants';
import { Route } from '@routes/(authenticated)/$organizationSlug/audit-logs/index';
import { useNavigate } from '@tanstack/react-router';

export function useAuditLogFilterState() {
  const { action, resourceType, fromDate } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const activeFilterCount = [action, resourceType, fromDate].filter(
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
    if (key === 'fromDate') {
      navigateFilter({ fromDate: undefined, toDate: undefined });
    } else {
      navigateFilter({ [key]: undefined });
    }
  };

  const chips: FilterChip[] = [];
  if (action !== undefined) {
    chips.push({
      key: 'action',
      label: 'Action',
      value: action.charAt(0).toUpperCase() + action.slice(1),
    });
  }
  if (resourceType !== undefined) {
    const label =
      AUDIT_LOG_RESOURCE_TYPE_LABELS[
        resourceType as keyof typeof AUDIT_LOG_RESOURCE_TYPE_LABELS
      ] ?? resourceType;
    chips.push({ key: 'resourceType', label: 'Resource', value: label });
  }
  if (fromDate !== undefined) {
    chips.push({ key: 'fromDate', label: 'Date', value: 'Custom range' });
  }

  return {
    activeFilterCount,
    chips,
    clearFilters,
    removeFilter,
    navigateFilter,
  };
}

import { ActionFilter } from '@components/audit-logs/filters/action-filter';
import { AuditLogDateRangeFilter } from '@components/audit-logs/filters/audit-log-date-range-filter';
import { ResourceTypeFilter } from '@components/audit-logs/filters/resource-type-filter';
import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { Route } from '@routes/(authenticated)/$organizationSlug/audit-logs/index';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';

function useActiveFilterCount() {
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

export function AuditLogFilters() {
  const { action, resourceType, fromDate } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const activeFilterCount = useActiveFilterCount();

  const navigateFilter = (updates: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      search: (prev) => ({
        page: 1,
        size: prev.size,
      }),
    });
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
      <ActionFilter
        value={action}
        onChange={(value) => navigateFilter({ action: value })}
      />
      <ResourceTypeFilter
        value={resourceType}
        onChange={(value) => navigateFilter({ resourceType: value })}
      />
      <AuditLogDateRangeFilter
        startDate={fromDate}
        onChange={({ startDate: s, endDate: e }) =>
          navigateFilter({ fromDate: s, toDate: e })
        }
      />
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-11 gap-2 text-base md:text-sm"
        >
          <X className="h-4 w-4" />
          Clear Filters
          <Badge variant="secondary">{activeFilterCount}</Badge>
        </Button>
      )}
    </div>
  );
}

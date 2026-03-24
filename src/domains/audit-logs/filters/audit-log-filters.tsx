import { Stack } from '@components/ds/atoms/stack';
import { ActionFilter } from '@domains/audit-logs/filters/action-filter';
import { AuditLogDateRangeFilter } from '@domains/audit-logs/filters/audit-log-date-range-filter';
import { ResourceTypeFilter } from '@domains/audit-logs/filters/resource-type-filter';
import { Route } from '@routes/(authenticated)/$organizationSlug/audit-logs/index';
import { useNavigate } from '@tanstack/react-router';

export function AuditLogFilterControls() {
  const { action, resourceType, fromDate } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const navigateFilter = (updates: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
    });
  };

  return (
    <Stack gap="md">
      <ActionFilter
        value={action}
        onChange={(value) => navigateFilter({ action: value })}
        fullWidth
      />
      <ResourceTypeFilter
        value={resourceType}
        onChange={(value) => navigateFilter({ resourceType: value })}
        fullWidth
      />
      <AuditLogDateRangeFilter
        startDate={fromDate}
        onChange={({ startDate: s, endDate: e }) =>
          navigateFilter({ fromDate: s, toDate: e })
        }
        fullWidth
      />
    </Stack>
  );
}

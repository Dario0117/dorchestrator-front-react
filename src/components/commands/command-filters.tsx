import { DateRangeFilter } from '@components/commands/filters/date-range-filter';
import { SearchInput } from '@components/commands/filters/search-input';
import { SelectFilter } from '@components/commands/filters/status-filter';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/commands/index';
import { useDevicesSuspenseQuery } from '@services/devices/list-devices.http-service';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useMemo } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const;

function useActiveFilterCount() {
  const { deviceId, status, startDate, search } = Route.useSearch();
  let count = 0;
  if (deviceId !== undefined) {
    count++;
  }
  if (status !== undefined) {
    count++;
  }
  if (startDate !== undefined) {
    count++;
  }
  if (search !== undefined) {
    count++;
  }
  return count;
}

function useDeviceOptions() {
  const currentOrganization = useCurrentOrganization();
  const { data } = useDevicesSuspenseQuery(currentOrganization.id, 1, 100);
  const devices = data.responseData?.results ?? [];

  return useMemo(
    () =>
      devices.map((d) => ({
        value: String(d.id),
        label: d.deviceName,
      })),
    [devices],
  );
}

export function CommandFilters() {
  const { status, deviceId, startDate, search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const activeFilterCount = useActiveFilterCount();
  const deviceOptions = useDeviceOptions();

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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <SearchInput
          value={search}
          onSearch={(value) => navigateFilter({ search: value })}
          placeholder="Search commands..."
          ariaLabel="Search commands"
        />
        <SelectFilter
          value={status}
          onChange={(value) => navigateFilter({ status: value })}
          options={[...STATUS_OPTIONS]}
          allLabel="All Statuses"
          ariaLabel="Filter by status"
        />
        <SelectFilter
          value={deviceId !== undefined ? String(deviceId) : undefined}
          onChange={(value) =>
            navigateFilter({
              deviceId: value !== undefined ? Number(value) : undefined,
            })
          }
          options={deviceOptions}
          allLabel="All Devices"
          ariaLabel="Filter by device"
        />
        <DateRangeFilter
          startDate={startDate}
          onChange={({ startDate: s, endDate: e }) =>
            navigateFilter({ startDate: s, endDate: e })
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
    </div>
  );
}

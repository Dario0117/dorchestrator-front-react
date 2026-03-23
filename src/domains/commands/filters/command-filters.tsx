import { ResponsiveRow } from '@components/ds/atoms/responsive-row';
import { Stack } from '@components/ds/atoms/stack';
import { TableFilters } from '@components/ds/organisms/table-filters';
import type { CommandStatus } from '@domains/commands/services/list-commands.http-service.constants';
import { useDevicesSuspenseQuery } from '@domains/devices/services/list-devices.http-service';
import { DateRangeFilter } from '@domains/shared/filters/date-range-filter';
import { SearchInput } from '@domains/shared/filters/search-input';
import { SelectFilter } from '@domains/shared/filters/select-filter';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const satisfies readonly { value: CommandStatus; label: string }[];

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
  const currentTeam = useCurrentTeam();
  const { data } = useDevicesSuspenseQuery(
    currentOrganization.id,
    // biome-ignore lint/style/noNonNullAssertion: Team is always defined in team-scoped routes (validated in route loader)
    currentTeam!.id,
    1,
    100,
  );
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
    <Stack gap="md">
      <TableFilters
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
      >
        <SearchInput
          value={search}
          onSearch={(value) => navigateFilter({ search: value })}
          placeholder="Search commands..."
          ariaLabel="Search commands"
        />
        <ResponsiveRow
          align="center"
          gap="md"
        >
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
        </ResponsiveRow>
      </TableFilters>
    </Stack>
  );
}

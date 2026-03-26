import { Stack } from '@components/ds/atoms/stack';
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
];

function useDeviceOptions() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const { data } = useDevicesSuspenseQuery(
    currentOrganization.id,
    currentTeam.id,
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

export function CommandFilterControls() {
  const { status, deviceId, startDate } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const deviceOptions = useDeviceOptions();

  const navigateFilter = (updates: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
    });
  };

  return (
    <Stack gap="md">
      <SelectFilter
        value={status}
        onChange={(value) => navigateFilter({ status: value })}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
        ariaLabel="Filter by status"
        fullWidth
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
        fullWidth
      />
      <DateRangeFilter
        startDate={startDate}
        onChange={({ startDate: s, endDate: e }) =>
          navigateFilter({ startDate: s, endDate: e })
        }
        fullWidth
      />
    </Stack>
  );
}

export function CommandSearchInput() {
  const { search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SearchInput
      value={search}
      onSearch={(value) =>
        navigate({
          search: (prev) => ({ ...prev, search: value, page: 1 }),
        })
      }
      placeholder="Search commands..."
      ariaLabel="Search commands"
    />
  );
}

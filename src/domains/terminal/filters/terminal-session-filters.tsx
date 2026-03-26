import { Input } from '@components/ds/atoms/input';
import { Stack } from '@components/ds/atoms/stack';
import { useDevicesQueryOptions } from '@domains/devices/services/list-devices.http-service';
import { useListMembersQueryOptions } from '@domains/org/services/organizations/list-members.http-service';
import { SelectFilter } from '@domains/shared/filters/select-filter';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useCurrentTeam } from '@domains/shared/hooks/use-current-team';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'created', label: 'Created' },
  { value: 'locked', label: 'Locked' },
  { value: 'terminated', label: 'Terminated' },
];

export function TerminalSessionFilterControls() {
  const currentOrganization = useCurrentOrganization();
  const currentTeam = useCurrentTeam();
  const { status, deviceId, userId, dateFrom, dateTo } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const organizationId = currentOrganization.id;
  const teamId = currentTeam.id;

  const { data: devicesData } = useQuery(
    useDevicesQueryOptions(organizationId, teamId, 1, 100),
  );
  const { data: membersData } = useQuery(
    useListMembersQueryOptions(organizationId, { page: 1, size: 100 }),
  );

  const devices = devicesData?.responseData?.results ?? [];
  const members = membersData?.responseData?.results ?? [];

  const deviceOptions = useMemo(
    () =>
      devices.map((d) => ({
        value: String(d.id),
        label: d.deviceName,
      })),
    [devices],
  );

  const memberOptions = useMemo(
    () =>
      members.map((m) => ({
        value: m.userId,
        label: m.name,
      })),
    [members],
  );

  const navigateFilter = (updates: Record<string, unknown>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
    });
  };

  const handleDateFromFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    navigateFilter({
      dateFrom: value ? `${value}T00:00:00.000Z` : undefined,
    });
  };

  const handleDateToFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    navigateFilter({
      dateTo: value ? `${value}T23:59:59.999Z` : undefined,
    });
  };

  return (
    <Stack gap="md">
      <SelectFilter
        value={status}
        onChange={(value) => navigateFilter({ status: value })}
        options={STATUS_OPTIONS}
        allLabel="All statuses"
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
        allLabel="All devices"
        ariaLabel="Filter by device"
        fullWidth
      />
      <SelectFilter
        value={userId}
        onChange={(value) => navigateFilter({ userId: value })}
        options={memberOptions}
        allLabel="All users"
        ariaLabel="Filter by user"
        fullWidth
      />
      <Input
        type="date"
        aria-label="From date"
        value={dateFrom?.slice(0, 10) ?? ''}
        onChange={handleDateFromFilter}
        placeholder="From"
      />
      <Input
        type="date"
        aria-label="To date"
        value={dateTo?.slice(0, 10) ?? ''}
        onChange={handleDateToFilter}
        placeholder="To"
      />
    </Stack>
  );
}

import { Stack } from '@components/ds/atoms/stack';
import type { FilterChip } from '@components/ds/molecules/filter-chips';
import type { DevicePlatform } from '@domains/devices/services/list-devices.http-service.constants';
import { DEVICE_PLATFORMS } from '@domains/devices/services/list-devices.http-service.constants';
import { SelectFilter } from '@domains/shared/filters/select-filter';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices';
import { useNavigate } from '@tanstack/react-router';

type DeviceStatus = 'online' | 'offline';

const STATUS_OPTIONS: { value: DeviceStatus; label: string }[] = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
];

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
};

const PLATFORM_OPTIONS = DEVICE_PLATFORMS.map((p) => ({
  value: p,
  label: PLATFORM_LABELS[p],
}));

export function useDeviceFilterState() {
  const { status, platform } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const activeFilterCount = [status, platform].filter(
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
    navigateFilter({ [key]: undefined });
  };

  const chips: FilterChip[] = [];
  if (status !== undefined) {
    const label =
      STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
    chips.push({ key: 'status', label: 'Status', value: label });
  }
  if (platform !== undefined) {
    const label =
      PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? platform;
    chips.push({ key: 'platform', label: 'Platform', value: label });
  }

  return {
    activeFilterCount,
    chips,
    clearFilters,
    removeFilter,
    navigateFilter,
  };
}

export function DeviceFilterControls() {
  const { status, platform } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

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
        value={platform}
        onChange={(value) => navigateFilter({ platform: value })}
        options={PLATFORM_OPTIONS}
        allLabel="All Platforms"
        ariaLabel="Filter by platform"
        fullWidth
      />
    </Stack>
  );
}

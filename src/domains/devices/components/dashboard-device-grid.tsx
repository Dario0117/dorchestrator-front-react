import { Grid } from '@components/ds/atoms/grid';
import { DeviceCard } from '@domains/devices/components/device-card';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { useMemo } from 'react';

export const ONLINE_THRESHOLD_MS = 30_000;

export function isDeviceOnline(device: ListDevicesDevice) {
  if (!device.lastSeenAt) {
    return false;
  }
  return (
    Date.now() - new Date(device.lastSeenAt).getTime() < ONLINE_THRESHOLD_MS
  );
}

export function sortDevicesByPriority(devices: ListDevicesDevice[]) {
  return [...devices].sort((a, b) => {
    const aOnline = isDeviceOnline(a);
    const bOnline = isDeviceOnline(b);

    // Offline devices first (problem prioritization)
    if (!aOnline && bOnline) {
      return -1;
    }
    if (aOnline && !bOnline) {
      return 1;
    }

    // Among offline, never-connected last
    if (!aOnline && !bOnline) {
      if (a.lastSeenAt && !b.lastSeenAt) {
        return -1;
      }
      if (!a.lastSeenAt && b.lastSeenAt) {
        return 1;
      }
    }

    return 0;
  });
}

interface DashboardDeviceGridProps {
  devices: ListDevicesDevice[];
  onRemove: (deviceId: number) => void;
  onExecuteCommand: (deviceId: number) => void;
  onOpenTerminal: (deviceId: number) => void;
  onConfigure?: (deviceId: number) => void;
}

export function DashboardDeviceGrid({
  devices,
  onRemove,
  onExecuteCommand,
  onOpenTerminal,
  onConfigure,
}: DashboardDeviceGridProps) {
  const sortedDevices = useMemo(
    () => sortDevicesByPriority(devices),
    [devices],
  );

  return (
    <Grid
      cols={3}
      gap="lg"
    >
      {sortedDevices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onRemove={onRemove}
          onExecuteCommand={() => onExecuteCommand(device.id)}
          onOpenTerminal={() => onOpenTerminal(device.id)}
          onConfigure={onConfigure ? () => onConfigure(device.id) : undefined}
        />
      ))}
    </Grid>
  );
}

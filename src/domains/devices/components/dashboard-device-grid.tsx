import { Grid } from '@components/ds/atoms/grid';
import { DeviceCard } from '@domains/devices/components/device-card';
import { useDevicesPresence } from '@domains/devices/hooks/use-devices-presence';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { useMemo } from 'react';

export function sortDevicesByPriority(
  devices: ListDevicesDevice[],
  presenceMap: Map<number, boolean>,
) {
  return [...devices].sort((a, b) => {
    const aOnline = presenceMap.get(a.id) ?? false;
    const bOnline = presenceMap.get(b.id) ?? false;

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
  const deviceIds = useMemo(() => devices.map((d) => d.id), [devices]);
  const { presenceMap } = useDevicesPresence(deviceIds);

  const sortedDevices = useMemo(
    () => sortDevicesByPriority(devices, presenceMap),
    [devices, presenceMap],
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
          isOnline={presenceMap.get(device.id) ?? false}
          onRemove={onRemove}
          onExecuteCommand={() => onExecuteCommand(device.id)}
          onOpenTerminal={() => onOpenTerminal(device.id)}
          onConfigure={onConfigure ? () => onConfigure(device.id) : undefined}
        />
      ))}
    </Grid>
  );
}

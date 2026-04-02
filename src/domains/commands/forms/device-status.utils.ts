import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import type { SelectOption } from '@domains/org/forms/components/app-form-select';

export const MAX_COMMAND_LENGTH = 10000;

function getStatusText(device: ListDevicesDevice, isOnline: boolean) {
  if (isOnline) {
    return 'Online';
  }
  if (!device.lastSeenAt) {
    return 'Never connected';
  }
  return 'Offline';
}

export function buildDeviceOptions(
  devices: ListDevicesDevice[],
  presenceMap: Map<number, boolean>,
): SelectOption[] {
  return devices.map((device) => {
    const online = presenceMap.get(device.id) ?? false;
    return {
      value: String(device.id),
      label: `${device.deviceName} (${getStatusText(device, online)})`,
    };
  });
}

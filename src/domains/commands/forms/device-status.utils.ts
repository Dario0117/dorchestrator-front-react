import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import type { SelectOption } from '@domains/org/forms/components/app-form-select';

export const MAX_COMMAND_LENGTH = 10000;
export const OFFLINE_THRESHOLD_SECONDS = 30;

export function getDeviceStatus(device: ListDevicesDevice) {
  if (!device.lastSeenAt) {
    return { color: 'bg-red-500', text: 'Never connected', isOnline: false };
  }

  const lastSeen = new Date(device.lastSeenAt);
  const now = new Date();
  const diffSeconds = (now.getTime() - lastSeen.getTime()) / 1000;

  if (diffSeconds < OFFLINE_THRESHOLD_SECONDS) {
    return { color: 'bg-green-500', text: 'Online', isOnline: true };
  }

  return { color: 'bg-gray-500', text: 'Offline', isOnline: false };
}

export function buildDeviceOptions(
  devices: ListDevicesDevice[],
): SelectOption[] {
  return devices.map((device) => {
    const status = getDeviceStatus(device);
    return {
      value: String(device.id),
      label: `${device.deviceName} (${status.text})`,
    };
  });
}

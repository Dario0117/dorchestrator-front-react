import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';

export type DevicePlatform = ListDevicesDevice['platform'];

export const DEVICE_PLATFORMS = [
  'linux',
  'macos',
  'windows',
] as const satisfies readonly DevicePlatform[];

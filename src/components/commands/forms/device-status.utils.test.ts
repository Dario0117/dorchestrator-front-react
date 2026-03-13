import {
  buildDeviceOptions,
  getDeviceStatus,
  MAX_COMMAND_LENGTH,
  OFFLINE_THRESHOLD_SECONDS,
} from '@components/commands/forms/device-status.utils';
import type { ListDevicesDevice } from '@services/devices/list-devices.http-service';

function createDevice(
  overrides: Partial<ListDevicesDevice> = {},
): ListDevicesDevice {
  return {
    id: 1,
    deviceName: 'Test Device',
    platform: 'linux' as const,
    lastSeenAt: new Date().toISOString(),
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getDeviceStatus', () => {
  it('should return "Never connected" when lastSeenAt is null', () => {
    const device = createDevice({ lastSeenAt: null });
    const result = getDeviceStatus(device);

    expect(result).toEqual({
      color: 'bg-red-500',
      text: 'Never connected',
      isOnline: false,
    });
  });

  it('should return "Online" when device was seen recently', () => {
    const recentDate = new Date(Date.now() - 5 * 1000).toISOString();
    const device = createDevice({ lastSeenAt: recentDate });
    const result = getDeviceStatus(device);

    expect(result).toEqual({
      color: 'bg-green-500',
      text: 'Online',
      isOnline: true,
    });
  });

  it('should return "Offline" when device was seen longer ago than threshold', () => {
    const oldDate = new Date(Date.now() - 120 * 1000).toISOString();
    const device = createDevice({ lastSeenAt: oldDate });
    const result = getDeviceStatus(device);

    expect(result).toEqual({
      color: 'bg-gray-500',
      text: 'Offline',
      isOnline: false,
    });
  });

  it('should return "Offline" when device was seen exactly at the threshold', () => {
    const thresholdDate = new Date(
      Date.now() - OFFLINE_THRESHOLD_SECONDS * 1000,
    ).toISOString();
    const device = createDevice({ lastSeenAt: thresholdDate });
    const result = getDeviceStatus(device);

    expect(result.isOnline).toBe(false);
    expect(result.text).toBe('Offline');
  });

  it('should return "Online" when device was seen 1 second ago', () => {
    const oneSecondAgo = new Date(Date.now() - 1000).toISOString();
    const device = createDevice({ lastSeenAt: oneSecondAgo });
    const result = getDeviceStatus(device);

    expect(result.isOnline).toBe(true);
    expect(result.text).toBe('Online');
  });
});

describe('buildDeviceOptions', () => {
  it('should return an empty array for no devices', () => {
    const result = buildDeviceOptions([]);

    expect(result).toEqual([]);
  });

  it('should build options with status text in the label', () => {
    const recentDate = new Date(Date.now() - 5 * 1000).toISOString();
    const devices = [
      createDevice({ id: 1, deviceName: 'Server A', lastSeenAt: recentDate }),
    ];
    const result = buildDeviceOptions(devices);

    expect(result).toEqual([{ value: '1', label: 'Server A (Online)' }]);
  });

  it('should handle multiple devices with different statuses', () => {
    const recentDate = new Date(Date.now() - 5 * 1000).toISOString();
    const oldDate = new Date(Date.now() - 120 * 1000).toISOString();
    const devices = [
      createDevice({ id: 1, deviceName: 'Online Box', lastSeenAt: recentDate }),
      createDevice({ id: 2, deviceName: 'Offline Box', lastSeenAt: oldDate }),
      createDevice({ id: 3, deviceName: 'New Box', lastSeenAt: null }),
    ];
    const result = buildDeviceOptions(devices);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ value: '1', label: 'Online Box (Online)' });
    expect(result[1]).toEqual({ value: '2', label: 'Offline Box (Offline)' });
    expect(result[2]).toEqual({
      value: '3',
      label: 'New Box (Never connected)',
    });
  });

  it('should convert device id to string for the value', () => {
    const devices = [createDevice({ id: 42, deviceName: 'Device 42' })];
    const result = buildDeviceOptions(devices);

    expect(result[0]?.value).toBe('42');
  });
});

describe('constants', () => {
  it('should export MAX_COMMAND_LENGTH as 10000', () => {
    expect(MAX_COMMAND_LENGTH).toBe(10000);
  });

  it('should export OFFLINE_THRESHOLD_SECONDS as 30', () => {
    expect(OFFLINE_THRESHOLD_SECONDS).toBe(30);
  });
});

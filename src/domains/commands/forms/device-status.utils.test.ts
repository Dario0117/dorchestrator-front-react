import {
  buildDeviceOptions,
  MAX_COMMAND_LENGTH,
} from '@domains/commands/forms/device-status.utils';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';

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

describe('buildDeviceOptions', () => {
  it('should return an empty array for no devices', () => {
    const result = buildDeviceOptions([], new Map());

    expect(result).toEqual([]);
  });

  it('should build options with status text in the label', () => {
    const devices = [createDevice({ id: 1, deviceName: 'Server A' })];
    const presenceMap = new Map([[1, true]]);
    const result = buildDeviceOptions(devices, presenceMap);

    expect(result).toEqual([{ value: '1', label: 'Server A (Online)' }]);
  });

  it('should handle multiple devices with different statuses', () => {
    const devices = [
      createDevice({ id: 1, deviceName: 'Online Box' }),
      createDevice({ id: 2, deviceName: 'Offline Box' }),
      createDevice({ id: 3, deviceName: 'New Box', lastSeenAt: null }),
    ];
    const presenceMap = new Map<number, boolean>([
      [1, true],
      [2, false],
      [3, false],
    ]);
    const result = buildDeviceOptions(devices, presenceMap);

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
    const result = buildDeviceOptions(devices, new Map());

    expect(result[0]?.value).toBe('42');
  });
});

describe('constants', () => {
  it('should export MAX_COMMAND_LENGTH as 10000', () => {
    expect(MAX_COMMAND_LENGTH).toBe(10000);
  });
});

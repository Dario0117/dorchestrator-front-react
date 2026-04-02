import {
  DashboardDeviceGrid,
  sortDevicesByPriority,
} from '@domains/devices/components/dashboard-device-grid';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPresenceMap = new Map<number, boolean>();

vi.mock('@domains/devices/hooks/use-devices-presence', () => ({
  useDevicesPresence: () => ({
    presenceMap: mockPresenceMap,
    isLoading: false,
  }),
}));

function createDevice(
  overrides: Partial<ListDevicesDevice> & { id: number },
): ListDevicesDevice {
  return {
    deviceName: `Device ${overrides.id}`,
    platform: 'linux',
    lastSeenAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('sortDevicesByPriority', () => {
  it('should sort offline devices before online devices', () => {
    const onlineDevice = createDevice({ id: 1, deviceName: 'Online' });
    const offlineDevice = createDevice({ id: 2, deviceName: 'Offline' });
    const presenceMap = new Map([
      [1, true],
      [2, false],
    ]);

    const sorted = sortDevicesByPriority(
      [onlineDevice, offlineDevice],
      presenceMap,
    );
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Online']);
  });

  it('should sort never-connected devices after offline devices', () => {
    const offlineDevice = createDevice({
      id: 1,
      deviceName: 'Offline',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    });
    const neverConnected = createDevice({
      id: 2,
      deviceName: 'Never Connected',
      lastSeenAt: null,
    });
    const presenceMap = new Map([
      [1, false],
      [2, false],
    ]);

    const sorted = sortDevicesByPriority(
      [neverConnected, offlineDevice],
      presenceMap,
    );
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Never Connected']);
  });

  it('should preserve order among online devices', () => {
    const device1 = createDevice({ id: 1, deviceName: 'First' });
    const device2 = createDevice({ id: 2, deviceName: 'Second' });
    const presenceMap = new Map([
      [1, true],
      [2, true],
    ]);

    const sorted = sortDevicesByPriority([device1, device2], presenceMap);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['First', 'Second']);
  });

  it('should sort mixed devices correctly: offline then never-connected then online', () => {
    const onlineDevice = createDevice({ id: 1, deviceName: 'Online' });
    const neverConnected = createDevice({
      id: 2,
      deviceName: 'Never Connected',
      lastSeenAt: null,
    });
    const offlineDevice = createDevice({
      id: 3,
      deviceName: 'Offline',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    });
    const presenceMap = new Map([
      [1, true],
      [2, false],
      [3, false],
    ]);

    const sorted = sortDevicesByPriority(
      [onlineDevice, neverConnected, offlineDevice],
      presenceMap,
    );
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Never Connected', 'Online']);
  });

  it('should handle empty array', () => {
    const sorted = sortDevicesByPriority([], new Map());
    expect(sorted).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const devices = [createDevice({ id: 1 }), createDevice({ id: 2 })];
    const original = [...devices];
    sortDevicesByPriority(devices, new Map());

    expect(devices).toEqual(original);
  });

  it('should sort online device after offline when online appears first in input', () => {
    const onlineDevice = createDevice({ id: 1, deviceName: 'Online' });
    const offlineDevice = createDevice({ id: 2, deviceName: 'Offline' });
    const onlineDevice2 = createDevice({ id: 3, deviceName: 'Online2' });
    const presenceMap = new Map([
      [1, true],
      [2, false],
      [3, true],
    ]);

    const sorted = sortDevicesByPriority(
      [onlineDevice, offlineDevice, onlineDevice2],
      presenceMap,
    );
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Online', 'Online2']);
  });

  it('should sort never-connected after offline when never-connected appears second', () => {
    const offlineDevice = createDevice({
      id: 1,
      deviceName: 'Offline',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    });
    const neverConnected = createDevice({
      id: 2,
      deviceName: 'Never Connected',
      lastSeenAt: null,
    });
    const offlineDevice2 = createDevice({
      id: 3,
      deviceName: 'Offline2',
      lastSeenAt: new Date(Date.now() - 30_000).toISOString(),
    });
    const presenceMap = new Map([
      [1, false],
      [2, false],
      [3, false],
    ]);

    const sorted = sortDevicesByPriority(
      [offlineDevice, neverConnected, offlineDevice2],
      presenceMap,
    );
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Offline2', 'Never Connected']);
  });

  it('should preserve order among two never-connected devices', () => {
    const neverA = createDevice({
      id: 1,
      deviceName: 'Never A',
      lastSeenAt: null,
    });
    const neverB = createDevice({
      id: 2,
      deviceName: 'Never B',
      lastSeenAt: null,
    });
    const presenceMap = new Map([
      [1, false],
      [2, false],
    ]);

    const sorted = sortDevicesByPriority([neverA, neverB], presenceMap);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Never A', 'Never B']);
  });
});

describe('DashboardDeviceGrid', () => {
  const mockDevices = [
    createDevice({ id: 1, deviceName: 'Web Server' }),
    createDevice({ id: 2, deviceName: 'DB Server' }),
  ];

  it('should render device cards for each device', () => {
    renderWithProviders(
      <DashboardDeviceGrid
        devices={mockDevices}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={vi.fn()}
      />,
    );

    expect(screen.getByText('Web Server')).toBeInTheDocument();
    expect(screen.getByText('DB Server')).toBeInTheDocument();
  });

  it('should render empty grid when no devices provided', () => {
    renderWithProviders(
      <DashboardDeviceGrid
        devices={[]}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Server|Device|Laptop/)).not.toBeInTheDocument();
  });

  it('should call onOpenTerminal with device id when terminal button clicked', async () => {
    mockPresenceMap.set(42, true);
    const user = userEvent.setup();
    const onOpenTerminal = vi.fn();

    renderWithProviders(
      <DashboardDeviceGrid
        devices={[createDevice({ id: 42, deviceName: 'Single Device' })]}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={onOpenTerminal}
      />,
    );

    const terminalButton = screen.getByRole('button', { name: /terminal/i });
    await user.click(terminalButton);
    expect(onOpenTerminal).toHaveBeenCalledWith(42);
    mockPresenceMap.delete(42);
  });

  it('should call onExecuteCommand with device id when command button clicked', async () => {
    const user = userEvent.setup();
    const onExecuteCommand = vi.fn();

    renderWithProviders(
      <DashboardDeviceGrid
        devices={[createDevice({ id: 7, deviceName: 'Exec Device' })]}
        onRemove={vi.fn()}
        onExecuteCommand={onExecuteCommand}
        onOpenTerminal={vi.fn()}
      />,
    );

    const commandButton = screen.getByRole('button', { name: /command/i });
    await user.click(commandButton);
    expect(onExecuteCommand).toHaveBeenCalledWith(7);
  });

  it('should call onConfigure with device id when configure button clicked', async () => {
    const user = userEvent.setup();
    const onConfigure = vi.fn();

    renderWithProviders(
      <DashboardDeviceGrid
        devices={[createDevice({ id: 15, deviceName: 'Configurable Device' })]}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={vi.fn()}
        onConfigure={onConfigure}
      />,
    );

    const configureButton = screen.getByRole('button', {
      name: /configure device/i,
    });
    await user.click(configureButton);
    expect(onConfigure).toHaveBeenCalledWith(15);
  });
});

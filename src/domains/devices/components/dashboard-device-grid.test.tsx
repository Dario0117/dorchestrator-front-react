import {
  DashboardDeviceGrid,
  sortDevicesByPriority,
} from '@domains/devices/components/dashboard-device-grid';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    const onlineDevice = createDevice({
      id: 1,
      deviceName: 'Online',
      lastSeenAt: new Date().toISOString(),
    });
    const offlineDevice = createDevice({
      id: 2,
      deviceName: 'Offline',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    });

    const sorted = sortDevicesByPriority([onlineDevice, offlineDevice]);
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

    const sorted = sortDevicesByPriority([neverConnected, offlineDevice]);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Never Connected']);
  });

  it('should preserve order among online devices', () => {
    const device1 = createDevice({
      id: 1,
      deviceName: 'First',
      lastSeenAt: new Date().toISOString(),
    });
    const device2 = createDevice({
      id: 2,
      deviceName: 'Second',
      lastSeenAt: new Date().toISOString(),
    });

    const sorted = sortDevicesByPriority([device1, device2]);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['First', 'Second']);
  });

  it('should sort online devices after offline devices (reverse input order)', () => {
    const offlineDevice = createDevice({
      id: 1,
      deviceName: 'Offline',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    });
    const onlineDevice = createDevice({
      id: 2,
      deviceName: 'Online',
      lastSeenAt: new Date().toISOString(),
    });

    const sorted = sortDevicesByPriority([offlineDevice, onlineDevice]);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Online']);
  });

  it('should sort never-connected before offline-with-lastSeen when never-connected comes second', () => {
    const neverConnected = createDevice({
      id: 1,
      deviceName: 'Never Connected',
      lastSeenAt: null,
    });
    const offlineDevice = createDevice({
      id: 2,
      deviceName: 'Offline',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    });

    const sorted = sortDevicesByPriority([offlineDevice, neverConnected]);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Never Connected']);
  });

  it('should sort mixed devices correctly: offline then never-connected then online', () => {
    const onlineDevice = createDevice({
      id: 1,
      deviceName: 'Online',
      lastSeenAt: new Date().toISOString(),
    });
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

    const sorted = sortDevicesByPriority([
      onlineDevice,
      neverConnected,
      offlineDevice,
    ]);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Offline', 'Never Connected', 'Online']);
  });

  it('should handle empty array', () => {
    const sorted = sortDevicesByPriority([]);
    expect(sorted).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const devices = [
      createDevice({
        id: 1,
        lastSeenAt: new Date().toISOString(),
      }),
      createDevice({
        id: 2,
        lastSeenAt: null,
      }),
    ];

    const original = [...devices];
    sortDevicesByPriority(devices);

    expect(devices).toEqual(original);
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

    const sorted = sortDevicesByPriority([neverA, neverB]);
    const names = sorted.map((d) => d.deviceName);

    expect(names).toEqual(['Never A', 'Never B']);
  });
});

describe('DashboardDeviceGrid', () => {
  const mockDevices = [
    createDevice({
      id: 1,
      deviceName: 'Web Server',
      lastSeenAt: new Date().toISOString(),
    }),
    createDevice({
      id: 2,
      deviceName: 'DB Server',
      lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
    }),
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

  it('should render devices in priority order (offline first)', () => {
    renderWithProviders(
      <DashboardDeviceGrid
        devices={mockDevices}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={vi.fn()}
      />,
    );

    const deviceNames = screen
      .getAllByText(/Web Server|DB Server/)
      .map((el) => el.textContent);
    expect(deviceNames[0]).toBe('DB Server');
    expect(deviceNames[1]).toBe('Web Server');
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

  it('should pass onConfigure callback when provided', () => {
    const onConfigure = vi.fn();

    renderWithProviders(
      <DashboardDeviceGrid
        devices={[
          createDevice({
            id: 10,
            deviceName: 'Config Device',
            lastSeenAt: new Date().toISOString(),
          }),
        ]}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={vi.fn()}
        onConfigure={onConfigure}
      />,
    );

    expect(screen.getByText('Config Device')).toBeInTheDocument();
  });

  it('should call onOpenTerminal with device id when terminal button clicked', async () => {
    const user = userEvent.setup();
    const onOpenTerminal = vi.fn();

    renderWithProviders(
      <DashboardDeviceGrid
        devices={[
          createDevice({
            id: 42,
            deviceName: 'Single Device',
            lastSeenAt: new Date().toISOString(),
          }),
        ]}
        onRemove={vi.fn()}
        onExecuteCommand={vi.fn()}
        onOpenTerminal={onOpenTerminal}
      />,
    );

    const terminalButton = screen.getByRole('button', { name: /terminal/i });
    await user.click(terminalButton);
    expect(onOpenTerminal).toHaveBeenCalledWith(42);
  });

  it('should call onExecuteCommand with device id when command button clicked', async () => {
    const user = userEvent.setup();
    const onExecuteCommand = vi.fn();

    renderWithProviders(
      <DashboardDeviceGrid
        devices={[
          createDevice({
            id: 7,
            deviceName: 'Exec Device',
            lastSeenAt: new Date().toISOString(),
          }),
        ]}
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
        devices={[
          createDevice({
            id: 15,
            deviceName: 'Configurable Device',
            lastSeenAt: new Date().toISOString(),
          }),
        ]}
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

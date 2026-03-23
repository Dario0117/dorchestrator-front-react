import { DeviceCard } from '@domains/devices/components/device-card';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockOnRemove = vi.fn();
const mockOnExecuteCommand = vi.fn();
const mockOnOpenTerminal = vi.fn();

function renderDeviceCard(device: ListDevicesDevice) {
  return renderWithProviders(
    <DeviceCard
      device={device}
      onRemove={mockOnRemove}
      onExecuteCommand={mockOnExecuteCommand}
      onOpenTerminal={mockOnOpenTerminal}
    />,
  );
}

describe('DeviceCard', () => {
  beforeEach(() => {
    mockOnRemove.mockClear();
    mockOnExecuteCommand.mockClear();
    mockOnOpenTerminal.mockClear();
  });

  it('should render device name', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'My Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('My Server')).toBeInTheDocument();
  });

  it('should render device ID', () => {
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('ID: 42')).toBeInTheDocument();
  });

  it('should display Linux platform label', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Linux')).toBeInTheDocument();
  });

  it('should display macOS platform label', () => {
    renderDeviceCard({
      id: 2,
      deviceName: 'Mac',
      platform: 'macos',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('macOS')).toBeInTheDocument();
  });

  it('should display Windows platform label', () => {
    renderDeviceCard({
      id: 3,
      deviceName: 'PC',
      platform: 'windows',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Windows')).toBeInTheDocument();
  });

  it('should display raw platform for unknown values', () => {
    renderDeviceCard({
      id: 4,
      deviceName: 'Device',
      platform: 'freebsd' as ListDevicesDevice['platform'],
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('freebsd')).toBeInTheDocument();
  });

  it('should show Online status for recently seen devices (< 30 seconds)', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should show StatusDot with online status for recently seen devices', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByRole('img', { name: 'Online' })).toBeInTheDocument();
  });

  it('should show Offline status for devices not seen recently', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: fiveMinutesAgo,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should show Never connected for devices without lastSeenAt', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: null,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Never connected')).toBeInTheDocument();
  });

  it('should show "Last seen: Never" for devices without lastSeenAt', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: null,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Last seen: Never')).toBeInTheDocument();
  });

  it('should show last seen time for offline devices', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: fiveMinutesAgo,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText(/Last seen:/)).toBeInTheDocument();
  });

  it('should not show last seen text for online devices', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.queryByText(/Last seen:/)).not.toBeInTheDocument();
  });

  it('should disable Terminal button when device is offline', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: fiveMinutesAgo,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Terminal').closest('button')).toBeDisabled();
  });

  it('should enable Terminal button when device is online', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Terminal').closest('button')).not.toBeDisabled();
  });

  it('should call onExecuteCommand when Command button is clicked', async () => {
    const user = userEvent.setup();
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await user.click(screen.getByText('Command'));

    expect(mockOnExecuteCommand).toHaveBeenCalledWith(42);
  });

  it('should call onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await user.click(screen.getByLabelText('Remove device'));

    expect(mockOnRemove).toHaveBeenCalledWith(42);
  });

  it('should call onOpenTerminal when Terminal button is clicked', async () => {
    const user = userEvent.setup();
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await user.click(screen.getByText('Terminal'));

    expect(mockOnOpenTerminal).toHaveBeenCalledWith(42);
  });

  it('should render configure button when onConfigure is provided', async () => {
    const mockOnConfigure = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DeviceCard
        device={{
          id: 42,
          deviceName: 'Server',
          platform: 'linux',
          lastSeenAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }}
        onRemove={mockOnRemove}
        onExecuteCommand={mockOnExecuteCommand}
        onOpenTerminal={mockOnOpenTerminal}
        onConfigure={mockOnConfigure}
      />,
    );

    const configButton = screen.getByLabelText('Configure device');
    expect(configButton).toBeInTheDocument();
    await user.click(configButton);

    expect(mockOnConfigure).toHaveBeenCalledWith(42);
  });

  it('should not render configure button when onConfigure is not provided', () => {
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.queryByLabelText('Configure device')).not.toBeInTheDocument();
  });
});

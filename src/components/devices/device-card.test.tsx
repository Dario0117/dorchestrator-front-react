import { DeviceCard } from '@components/devices/device-card';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { ListDevicesDevice } from '@services/devices/list-devices.http-service';
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

  it('should show "Last seen: Just now" for devices seen less than a minute ago', () => {
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date(Date.now() - 10 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Last seen: Just now')).toBeInTheDocument();
  });

  it('should show minutes ago for devices seen recently', () => {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: threeMinutesAgo,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Last seen: 3 minutes ago')).toBeInTheDocument();
  });

  it('should show "1 minute ago" for singular minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 90 * 1000).toISOString();
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: oneMinuteAgo,
      createdAt: new Date().toISOString(),
    });

    expect(screen.getByText('Last seen: 1 minute ago')).toBeInTheDocument();
  });

  it('should show formatted date for devices seen more than an hour ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    renderDeviceCard({
      id: 1,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: twoHoursAgo,
      createdAt: new Date().toISOString(),
    });

    // Should display formatted date like "Feb 15, 10:30 AM"
    expect(screen.getByText(/Last seen:/)).toBeInTheDocument();
    expect(screen.queryByText(/minutes? ago/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Just now/)).not.toBeInTheDocument();
  });

  it('should call onExecuteCommand when Execute Command button is clicked', async () => {
    const user = userEvent.setup();
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await user.click(screen.getByText('Execute Command'));

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

    // The remove button has just a Trash icon, find it by role
    const buttons = screen.getAllByRole('button');
    const removeButton = buttons.find((btn) =>
      btn.querySelector('svg.lucide-trash-2'),
    );
    expect(removeButton).toBeInTheDocument();
    await user.click(removeButton as HTMLElement);

    expect(mockOnRemove).toHaveBeenCalledWith(42);
  });

  it('should call onOpenTerminal when Open Terminal button is clicked', async () => {
    const user = userEvent.setup();
    renderDeviceCard({
      id: 42,
      deviceName: 'Server',
      platform: 'linux',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await user.click(screen.getByText('Open Terminal'));

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

    const buttons = screen.getAllByRole('button');
    const configButton = buttons.find((btn) =>
      btn.querySelector('svg.lucide-settings'),
    );
    expect(configButton).toBeInTheDocument();
    await user.click(configButton as HTMLElement);

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

    const buttons = screen.getAllByRole('button');
    const configButton = buttons.find((btn) =>
      btn.querySelector('svg.lucide-settings'),
    );
    expect(configButton).toBeUndefined();
  });
});

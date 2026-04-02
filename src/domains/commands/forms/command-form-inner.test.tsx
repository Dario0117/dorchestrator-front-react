import type { SandboxState } from '@domains/commands/forms/command-form.types';
import { CommandFormInner } from '@domains/commands/forms/command-form-inner';
import { useCommandForm } from '@domains/commands/forms/hooks/use-command-form';
import type { useSubmitCommandMutationType } from '@domains/commands/services/submit-command.http-service';
import type { ListDevicesDevice } from '@domains/devices/services/list-devices.http-service';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Device ID 1 is online; others are offline
const onlineDeviceIds = new Set([1]);
vi.mock('@domains/devices/hooks/use-devices-presence', () => ({
  useDevicesPresence: (deviceIds: number[]) => ({
    presenceMap: new Map(deviceIds.map((id) => [id, onlineDeviceIds.has(id)])),
    isLoading: false,
  }),
}));

const now = new Date();
const recentDate = new Date(now.getTime() - 5 * 1000).toISOString();
const oldDate = new Date(now.getTime() - 120 * 1000).toISOString();

const mockDevices: ListDevicesDevice[] = [
  {
    id: 1,
    deviceName: 'Online Server',
    platform: 'linux' as const,
    lastSeenAt: recentDate,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    deviceName: 'Offline Laptop',
    platform: 'macos' as const,
    lastSeenAt: oldDate,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

const mockMutation = {
  mutate: vi.fn(),
} as unknown as useSubmitCommandMutationType;

function TestWrapper({
  pinnedDevice,
  onCancel,
  onDeviceChange,
  sandbox,
  devices = mockDevices,
}: {
  pinnedDevice?: { id: number; name: string };
  onCancel?: () => void;
  onDeviceChange?: (deviceId: number) => void;
  sandbox?: SandboxState;
  devices?: ListDevicesDevice[];
}) {
  const form = useCommandForm({
    submitCommandMutation: mockMutation,
    handleSuccess: vi.fn(),
    organizationId: 'org-1',
    teamId: 'team-1',
    initialDeviceId: pinnedDevice?.id,
    sandboxPresetId: 1,
  });

  return (
    <CommandFormInner
      form={form}
      devices={devices}
      pinnedDevice={pinnedDevice}
      onCancel={onCancel}
      onDeviceChange={onDeviceChange}
      sandbox={sandbox}
    />
  );
}

async function selectDeviceAndTypeCommand(
  user: ReturnType<typeof userEvent.setup>,
  deviceName: RegExp,
) {
  const trigger = screen.getByRole('combobox', { name: /Device/ });
  await clickTrigger(trigger);

  await waitFor(() => {
    expect(
      screen.getByRole('option', { name: deviceName }),
    ).toBeInTheDocument();
  });

  await user.click(screen.getByRole('option', { name: deviceName }));

  const textarea = await screen.findByPlaceholderText('Enter your command...');
  await user.click(textarea);
  await user.type(textarea, 'ls -la');
  await user.tab();

  const submitButton = screen.getByRole('button', {
    name: /Execute Command|Request Approval/,
  });
  await waitFor(() => {
    expect(submitButton).not.toBeDisabled();
  });

  return submitButton;
}

describe('CommandFormInner', () => {
  it('should submit directly when selected device is online (no offline dialog)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    const submitButton = await selectDeviceAndTypeCommand(
      user,
      /Online Server/,
    );
    await user.click(submitButton);

    // Should NOT show offline dialog since device is online
    expect(screen.queryByText('Device Offline')).not.toBeInTheDocument();
  });

  it('should call onCancel when cancel is clicked and onCancel is provided', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper onCancel={onCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should show "Close" and "Pending Approval" when sandbox.approvalPending is true', async () => {
    const sandbox: SandboxState = {
      activePresetId: 1,
      effectivePresetId: 1,
      isSandboxOverride: false,
      approvalPending: true,
      onPresetChange: vi.fn(),
      presets: [],
    };

    renderWithProviders(<TestWrapper sandbox={sandbox} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Pending Approval' }),
    ).toBeDisabled();

    // "Execute Command" button should not be present
    expect(
      screen.queryByRole('button', { name: 'Execute Command' }),
    ).not.toBeInTheDocument();
  });

  it('should show "Request Approval" when sandbox.isSandboxOverride is true', async () => {
    const sandbox: SandboxState = {
      activePresetId: 2,
      effectivePresetId: 1,
      isSandboxOverride: true,
      approvalPending: false,
      onPresetChange: vi.fn(),
      presets: [],
    };

    renderWithProviders(<TestWrapper sandbox={sandbox} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Request Approval' }),
      ).toBeInTheDocument();
    });

    // "Execute Command" should not be present
    expect(
      screen.queryByRole('button', { name: 'Execute Command' }),
    ).not.toBeInTheDocument();
  });

  it('should notify parent via onDeviceChange when device selection changes', async () => {
    const onDeviceChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper onDeviceChange={onDeviceChange} />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    const trigger = screen.getByRole('combobox', { name: /Device/ });
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Online Server/ }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: /Online Server/ }));

    await waitFor(() => {
      expect(onDeviceChange).toHaveBeenCalledWith(1);
    });
  });
});

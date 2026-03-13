import { CommandForm } from '@components/commands/forms/command-form';
import { useCommandForm } from '@components/commands/forms/hooks/use-command-form';
import { queryClient } from '@context/query.provider';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { useSubmitCommandMutationType } from '@services/commands/submit-command.http-service';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

vi.mock('@hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

const now = new Date();
const recentDate = new Date(now.getTime() - 5 * 1000).toISOString();
const oldDate = new Date(now.getTime() - 120 * 1000).toISOString();

const mockDevices = [
  {
    id: 1,
    deviceName: 'Test Server',
    platform: 'linux' as const,
    lastSeenAt: recentDate,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    deviceName: 'Dev Laptop',
    platform: 'darwin' as const,
    lastSeenAt: oldDate,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    deviceName: 'Build Agent',
    platform: 'linux' as const,
    lastSeenAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    deviceName: 'Staging Box',
    platform: 'linux' as const,
    lastSeenAt: recentDate,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    deviceName: 'CI Runner',
    platform: 'linux' as const,
    lastSeenAt: oldDate,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

vi.mock('@services/devices/list-devices.http-service', () => ({
  useDevicesSuspenseQuery: vi.fn(() => ({
    data: {
      responseData: {
        results: mockDevices,
        hasNext: false,
        hasPrevious: false,
        totalResults: mockDevices.length,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    },
  })),
}));

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

function TestWrapper({
  pinnedDevice,
}: {
  pinnedDevice?: { id: number; name: string };
}) {
  const mockMutation = {
    mutate: vi.fn(),
  } as unknown as useSubmitCommandMutationType;
  const mockHandleSuccess = vi.fn();

  const form = useCommandForm({
    submitCommandMutation: mockMutation,
    handleSuccess: mockHandleSuccess,
    organizationId: 'org-1',
    initialDeviceId: pinnedDevice?.id,
  });

  return (
    <CommandForm
      form={form}
      pinnedDevice={pinnedDevice}
    />
  );
}

async function openDeviceSelect(user: ReturnType<typeof userEvent.setup>) {
  // The AppFormSelect sets id={field.name} on the trigger button
  const trigger = screen.getByRole('combobox', { name: /Device/ });
  await user.click(trigger);
}

describe('CommandForm', () => {
  beforeEach(() => {
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [mockOrganization],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  });

  it('should render form with device dropdown and command textarea', async () => {
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Command/)).toBeInTheDocument();
    expect(screen.getByText('Select a device...')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your command...'),
    ).toBeInTheDocument();
  });

  it('should display devices with status indicators in dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    await openDeviceSelect(user);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Test Server/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /Dev Laptop/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /Build Agent/ }),
      ).toBeInTheDocument();
    });

    // Verify status text is included in option labels
    const testServerOption = screen.getByRole('option', {
      name: /Test Server/,
    });
    expect(testServerOption.textContent).toContain('Online');
  });

  it('should show character counter', async () => {
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('0/10,000')).toBeInTheDocument();
    });
  });

  it('should update character counter when typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Enter your command...'),
      ).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'echo hello');

    await waitFor(() => {
      expect(screen.getByText('10/10,000')).toBeInTheDocument();
    });
  });

  it('should show pinned device as disabled dropdown when pinnedDevice is provided', async () => {
    renderWithProviders(
      <TestWrapper pinnedDevice={{ id: 2, name: 'Dev Laptop' }} />,
    );

    const trigger = await screen.findByRole('combobox', { name: /Device/ });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent('Dev Laptop');
  });

  it('should show offline confirmation dialog when submitting for offline device', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    // Open select and choose offline device
    await openDeviceSelect(user);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Dev Laptop/ }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: /Dev Laptop/ }));

    // Type a command
    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'ls -la');

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: 'Execute Command',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Device Offline')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Device is currently offline. Command will execute when device reconnects/,
        ),
      ).toBeInTheDocument();
    });
  });

  it('should close offline dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    // Open select and choose offline device
    await openDeviceSelect(user);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Dev Laptop/ }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: /Dev Laptop/ }));

    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'ls -la');

    // Submit the form
    const submitButton = screen.getByRole('button', {
      name: 'Execute Command',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Device Offline')).toBeInTheDocument();
    });

    // Click cancel on the dialog
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Device Offline')).not.toBeInTheDocument();
    });
  });

  it('should render cancel button', async () => {
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((btn) => btn.textContent === 'Cancel');
    expect(cancelButton).toBeDefined();
  });

  it('should call window.history.back when cancel is clicked without onCancel prop', async () => {
    const historyBackSpy = vi
      .spyOn(window.history, 'back')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(historyBackSpy).toHaveBeenCalledOnce();
    historyBackSpy.mockRestore();
  });

  it('should submit form when Continue is clicked on offline confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Device')).toBeInTheDocument();
    });

    // Select offline device
    await openDeviceSelect(user);
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Dev Laptop/ }),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /Dev Laptop/ }));

    // Type a command
    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'ls -la');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Execute Command' }));

    // Wait for offline dialog
    await waitFor(() => {
      expect(screen.getByText('Device Offline')).toBeInTheDocument();
    });

    // Click Continue
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Device Offline')).not.toBeInTheDocument();
    });
  });

  it('should submit directly for pinned device without offline check', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TestWrapper pinnedDevice={{ id: 2, name: 'Dev Laptop' }} />,
    );

    const trigger = await screen.findByRole('combobox', { name: /Device/ });
    expect(trigger).toHaveTextContent('Dev Laptop');

    // Type a command
    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'ls -la');

    // Submit — button should be enabled after typing
    const submitButton = await screen.findByRole('button', {
      name: 'Execute Command',
    });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    await user.click(submitButton);

    // Should NOT show offline dialog (pinnedDevice skips offline check)
    expect(screen.queryByText('Device Offline')).not.toBeInTheDocument();
  });
});

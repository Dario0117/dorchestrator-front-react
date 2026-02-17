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
  });

  return (
    <CommandForm
      form={form}
      pinnedDevice={pinnedDevice}
    />
  );
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
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Command/)).toBeInTheDocument();
    expect(screen.getByText('Select a device...')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your command...'),
    ).toBeInTheDocument();
  });

  it('should display devices with status indicators in dropdown', async () => {
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Device/);
    const options = select.querySelectorAll('option');

    // Default option + 5 mock devices
    expect(options.length).toBe(6);
    expect(options[1]?.textContent).toContain('Test Server');
    expect(options[1]?.textContent).toContain('Online');
    expect(options[2]?.textContent).toContain('Dev Laptop');
    expect(options[2]?.textContent).toContain('Offline');
    expect(options[3]?.textContent).toContain('Build Agent');
    expect(options[3]?.textContent).toContain('Never connected');
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

    await waitFor(() => {
      const select = screen.getByLabelText(/Device/) as HTMLSelectElement;
      expect(select.value).toBe('2');
      expect(select).toBeDisabled();
      expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
    });
  });

  it('should show offline confirmation dialog when submitting for offline device', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });

    // Select offline device (Dev Laptop, id: 2)
    const select = screen.getByLabelText(/Device/);
    await user.selectOptions(select, '2');

    // Type a command
    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'ls -la');

    // Submit the form - use submit button specifically
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
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });

    // Select offline device and enter command
    const select = screen.getByLabelText(/Device/);
    await user.selectOptions(select, '2');
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
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find((btn) => btn.textContent === 'Cancel');
    expect(cancelButton).toBeDefined();
  });
});

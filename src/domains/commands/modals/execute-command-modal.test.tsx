import { ExecuteCommandModal } from '@domains/commands/modals/execute-command-modal';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
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

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useCurrentTeam: vi.fn(() => ({
    id: 'team-1',
    name: 'Default Team',
    slug: 'default',
    organizationId: 'org-1',
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

describe('ExecuteCommandModal', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
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

  it('should render modal when open', async () => {
    renderWithProviders(
      <ExecuteCommandModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId="org-1"
        teamId="team-1"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Execute Command' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });
  });

  it('should not render modal when closed', () => {
    renderWithProviders(
      <ExecuteCommandModal
        open={false}
        onOpenChange={mockOnOpenChange}
        organizationId="org-1"
        teamId="team-1"
      />,
    );

    expect(screen.queryByText('Execute Command')).not.toBeInTheDocument();
  });

  it('should show the command form with device selector', async () => {
    renderWithProviders(
      <ExecuteCommandModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId="org-1"
        teamId="team-1"
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });
    expect(
      screen.getByPlaceholderText('Enter your command...'),
    ).toBeInTheDocument();
  });

  it('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExecuteCommandModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId="org-1"
        teamId="team-1"
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close modal after successful submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ExecuteCommandModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId="org-1"
        teamId="team-1"
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Device/)).toBeInTheDocument();
    });

    // Select device and enter command
    await clickTrigger(screen.getByLabelText(/Device/));
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Test Server/ }),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /Test Server/ }));

    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'echo hello');

    const submitButton = screen.getByRole('button', {
      name: 'Execute Command',
    });
    await user.click(submitButton);

    // Device may appear offline if lastSeenAt from MSW handler is stale (>30s),
    // which shows an offline confirmation dialog instead of submitting directly
    const continueButton = await screen
      .findByRole('button', { name: 'Continue' })
      .catch(() => null);
    if (continueButton) {
      await user.click(continueButton);
    }

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

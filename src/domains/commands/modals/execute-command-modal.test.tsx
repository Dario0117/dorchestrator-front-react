import { ExecuteCommandModal } from '@domains/commands/modals/execute-command-modal';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

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

  it('should show pinned device description when pinnedDevice is provided', async () => {
    renderWithProviders(
      <ExecuteCommandModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId="org-1"
        teamId="team-1"
        pinnedDevice={{ id: 42, name: 'My Device' }}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Execute a command on My Device.'),
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

  it('should request approval when sandbox override is required', async () => {
    // Override device sandbox config to return a preset that requires approval (id: 2)
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/devices/{deviceId}/sandbox/config',
        ),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                presetId: 2,
                presetName: 'Restricted Docker',
                sandboxTypeId: 2,
                category: 'container',
                networkPolicy: {
                  mode: 'allow-list',
                  allow: {
                    external: [{ host: 'registry.npmjs.org', ports: [443] }],
                    local: [],
                  },
                  deny: undefined,
                },
                resourceLimits: {
                  maxTimeoutMs: 60000,
                  maxOutputSize: 2097152,
                  pidsLimit: 50,
                },
                volumeMounts: null,
                providerConfig: { image: 'dorchestrator/sandbox:latest' },
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

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

    // Select device
    await clickTrigger(screen.getByLabelText(/Device/));
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Test Server/ }),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /Test Server/ }));

    // Wait for sandbox config to load and button text to update
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Request Approval' }),
      ).toBeInTheDocument();
    });

    // Enter command
    const textarea = screen.getByPlaceholderText('Enter your command...');
    await user.type(textarea, 'echo hello');

    // Click "Request Approval" — triggers onBeforeSubmit which calls requestOverrideMutation
    const requestApprovalButton = screen.getByRole('button', {
      name: 'Request Approval',
    });
    await user.click(requestApprovalButton);

    // Device may appear offline — handle the confirm dialog
    const continueButton = await screen
      .findByRole('button', { name: 'Continue' })
      .catch(() => null);
    if (continueButton) {
      await user.click(continueButton);
    }

    // After the override mutation succeeds, approvalPending should be true
    // which renders "Pending Approval" disabled button and "Close" instead of "Cancel"
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Pending Approval' }),
      ).toBeInTheDocument();
    });
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
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

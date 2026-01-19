import { AddDeviceModal } from '@components/devices/add-device-modal';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/../testsSetup';

const mockToken = 'test-token-12345-abcdef-67890';
const mockExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

describe('AddDeviceModal', () => {
  const mockOnOpenChange = vi.fn();
  const organizationId = 'org-123';

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  it('should render modal when open', () => {
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    expect(screen.getByText('Add New Device')).toBeInTheDocument();
    expect(
      screen.getByText(/Generate a registration token/),
    ).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    renderWithProviders(
      <AddDeviceModal
        open={false}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    expect(screen.queryByText('Add New Device')).not.toBeInTheDocument();
  });

  it('should show Generate Token button initially', () => {
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    expect(screen.getByText('Generate Token')).toBeInTheDocument();
  });

  it('should generate token on button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    const generateButton = screen.getByText('Generate Token');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });
  });

  it('should display token input after generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByLabelText('Registration Token')).toBeInTheDocument();
    });
  });

  it('should display CLI command after token generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByLabelText('CLI Command')).toBeInTheDocument();
      const cliInput = screen.getByLabelText('CLI Command') as HTMLInputElement;
      expect(cliInput.value).toContain('dorchestrator register');
    });
  });

  it('should have copy button for token', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });

    // Find the token input container and verify copy button exists
    const tokenInput = screen.getByLabelText('Registration Token');
    const tokenCopyButton =
      tokenInput.parentElement?.querySelector('button[data-slot="button"]');
    expect(tokenCopyButton).toBeInTheDocument();
  });

  it('should have copy button for CLI command', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByLabelText('CLI Command')).toBeInTheDocument();
    });

    // Find the CLI input container and verify copy button exists
    const cliInput = screen.getByLabelText('CLI Command');
    const cliCopyButton =
      cliInput.parentElement?.querySelector('button[data-slot="button"]');
    expect(cliCopyButton).toBeInTheDocument();
  });

  it('should show download agent link after token generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      const link = screen.getByText('Download agent →');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/dorchestrator/dorchestrator-agent/releases',
      );
    });
  });

  it('should display expiration time after token generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByText(/Token expires in/)).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    server.use(
      http.post(buildBackendUrl('/api/v1/:organizationId/devices'), () => {
        return HttpResponse.json(
          {
            responseData: null,
            responseErrors: {
              nonFieldErrors: ['Custom error message'],
            },
          },
          { status: 400 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  it('should show default error message when no nonFieldErrors provided', async () => {
    server.use(
      http.post(buildBackendUrl('/api/v1/:organizationId/devices'), () => {
        return HttpResponse.json(
          {
            responseData: null,
            responseErrors: {},
          },
          { status: 400 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to generate token. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should show Generating... text while mutation is pending', async () => {
    server.use(
      http.post(buildBackendUrl('/api/v1/:organizationId/devices'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          responseData: {
            results: {
              token: mockToken,
              expiresAt: mockExpiresAt,
            },
          },
          responseErrors: null,
        });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });
  });
});

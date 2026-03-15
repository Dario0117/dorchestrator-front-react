import { AddDeviceModal } from '@components/devices/add-device-modal';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GenerateTokenErrorResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['400']['content']['application/json'];
type GenerateTokenSuccessResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['201']['content']['application/json'];

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
        teamId="team-1"
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
        teamId="team-1"
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
        teamId="team-1"
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
        teamId="team-1"
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
        teamId="team-1"
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
        teamId="team-1"
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
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });

    // Find the token input container and verify copy button exists
    const tokenInput = screen.getByLabelText('Registration Token');
    const tokenCopyButton = tokenInput.parentElement?.querySelector(
      'button[data-slot="button"]',
    );
    expect(tokenCopyButton).toBeInTheDocument();
  });

  it('should have copy button for CLI command', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByLabelText('CLI Command')).toBeInTheDocument();
    });

    // Find the CLI input container and verify copy button exists
    const cliInput = screen.getByLabelText('CLI Command');
    const cliCopyButton = cliInput.parentElement?.querySelector(
      'button[data-slot="button"]',
    );
    expect(cliCopyButton).toBeInTheDocument();
  });

  it('should show download agent link after token generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
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
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByText(/Token expires in/)).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    server.use(
      http.post<never, never, GenerateTokenErrorResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: {
                nonFieldErrors: ['Custom error message'],
              },
            },
            { status: 400 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  it('should show default error message when no nonFieldErrors provided', async () => {
    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          // Testing edge case where responseErrors is empty - use type bypass
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: {},
            } as GenerateTokenErrorResponse,
            { status: 400 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
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
      http.post<never, never, GenerateTokenSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        async () => {
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
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });
  });

  it('should copy token to clipboard when copy token button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });

    // Spy on the clipboard after userEvent.setup has configured it
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

    const tokenInput = screen.getByLabelText('Registration Token');
    const tokenCopyButton = tokenInput.parentElement?.querySelector(
      'button[data-slot="button"]',
    ) as HTMLButtonElement;
    expect(tokenCopyButton).toBeInTheDocument();
    fireEvent.click(tokenCopyButton);

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(mockToken);
    });

    // CheckCircle icon should appear (the copied state is true)
    await waitFor(() => {
      expect(
        tokenCopyButton.querySelector('svg.lucide-circle-check-big'),
      ).toBeInTheDocument();
    });

    writeTextSpy.mockRestore();
  });

  it('should copy CLI command to clipboard when copy CLI button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByLabelText('CLI Command')).toBeInTheDocument();
    });

    // Spy on the clipboard after userEvent.setup has configured it
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

    const cliInput = screen.getByLabelText('CLI Command');
    const cliCopyButton = cliInput.parentElement?.querySelector(
      'button[data-slot="button"]',
    ) as HTMLButtonElement;
    expect(cliCopyButton).toBeInTheDocument();
    fireEvent.click(cliCopyButton);

    const expectedCommand = `dorchestrator register --org-id "${organizationId}" --name "random name" --token "${mockToken}"`;
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(expectedCommand);
    });

    writeTextSpy.mockRestore();
  });

  it('should not display token when onSuccess result has no responseData.results', async () => {
    server.use(
      http.post(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          } as unknown as GenerateTokenSuccessResponse);
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    // Wait for the mutation to settle
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });

    // Token should not be displayed since responseData.results is falsy
    expect(
      screen.queryByLabelText('Registration Token'),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('CLI Command')).not.toBeInTheDocument();
    // Generate Token button should still be visible
    expect(screen.getByText('Generate Token')).toBeInTheDocument();
  });

  it('should show empty expiration when expiresAt is not provided', async () => {
    server.use(
      http.post<never, never, GenerateTokenSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                token: mockToken,
                expiresAt: null as unknown as string,
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(
      <AddDeviceModal
        open={true}
        onOpenChange={mockOnOpenChange}
        organizationId={organizationId}
        teamId="team-1"
      />,
    );

    await user.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockToken)).toBeInTheDocument();
    });

    // The expiration paragraph should be empty (formatExpiration returns '')
    expect(screen.queryByText(/Token expires in/)).not.toBeInTheDocument();
  });
});

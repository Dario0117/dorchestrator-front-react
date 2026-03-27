import { CreateTerminalSessionDialog } from '@domains/terminal/modals/create-terminal-session-dialog';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders, selectOption } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type CeilingSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigEffectiveByDeviceId']['responses']['200']['content']['application/json'];

type DeviceConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];

type CreateSessionErrorResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['400']['content']['application/json'];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  organizationId: 'org-123',
  teamId: 'team-1',
  deviceId: 1,
  deviceName: 'Test Device',
  terminalAuthToken: 'auth-token-123',
  onSessionCreated: vi.fn(),
};

function useCeilingWithHardCap() {
  server.use(
    http.get<never, never, CeilingSuccessResponse>(
      buildBackendUrl(
        '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
      ),
      () => {
        return HttpResponse.json({
          responseData: {
            results: {
              effectiveInactivityCeilingMs: 7_200_000,
              effectiveHardCapCeilingMs: 86_400_000,
              source: 'device',
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function useDeviceConfigWithWorkingDirectory() {
  server.use(
    http.get<never, never, DeviceConfigSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/terminal/config/{deviceId}'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: {
              config: {
                inactivityTimeoutMs: 3_600_000,
                hardCapMs: null,
                maxConcurrentSessions: 5,
                defaultWorkingDirectory: '/opt/app',
                recordingRetentionDays: null,
                recordingMaxSizePerSessionBytes: null,
                recordingMaxSizePerOrgBytes: null,
              },
              inherited: false,
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function useOrgSourceCeiling() {
  server.use(
    http.get<never, never, CeilingSuccessResponse>(
      buildBackendUrl(
        '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
      ),
      () => {
        return HttpResponse.json({
          responseData: {
            results: {
              effectiveInactivityCeilingMs: 7_200_000,
              effectiveHardCapCeilingMs: null,
              source: 'org',
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

// Validation, preset filtering, ceiling logic, and custom input behavior are
// tested in use-create-terminal-session-dialog.test.ts. These tests focus on
// the dialog wrapper: open/close, loading, cancel, and end-to-end flow.

describe('CreateTerminalSessionDialog', () => {
  beforeEach(() => {
    defaultProps.onOpenChange.mockClear();
    defaultProps.onSessionCreated.mockClear();
  });

  it('should render dialog when open is true', () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    expect(screen.getByText('New Terminal Session')).toBeInTheDocument();
    expect(
      screen.getByText(/Configure session timeout for Test Device/),
    ).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    renderWithProviders(
      <CreateTerminalSessionDialog
        {...defaultProps}
        open={false}
      />,
    );

    expect(screen.queryByText('New Terminal Session')).not.toBeInTheDocument();
  });

  it('should show loading skeletons while data is loading', () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
        ),
        () => {
          return new Promise(() => {
            // intentionally never resolves to simulate loading
          });
        },
      ),
    );

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    expect(
      screen.queryByLabelText('Inactivity Timeout'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Start Session')).toBeDisabled();
  });

  it('should render form fields after data loads', async () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    expect(screen.getByText('Working Directory')).toBeInTheDocument();
  });

  it('should call onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onSessionCreated on successful submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(defaultProps.onSessionCreated).toHaveBeenCalledWith(1);
    });
  });

  it('should show API error message on mutation failure', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
        ),
        () => {
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: {
                nonFieldErrors: ['Session limit reached'],
              },
            } as CreateSessionErrorResponse,
            { status: 400 },
          );
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Session limit reached')).toBeInTheDocument();
    });
  });

  it('should allow changing the inactivity timeout selection', async () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await selectOption(
      screen.getByLabelText('Inactivity Timeout'),
      '15 minutes',
    );

    expect(screen.getByLabelText('Inactivity Timeout')).toHaveTextContent('15');
  });

  it('should show custom inactivity input when Custom is selected', async () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await selectOption(
      screen.getByLabelText('Inactivity Timeout'),
      'Custom...',
    );

    const customInput = screen.getByPlaceholderText('Minutes');
    expect(customInput).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(customInput, '25');

    expect(customInput).toHaveValue(25);
  });

  it('should render hard cap section when ceiling has hard cap', async () => {
    useCeilingWithHardCap();

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Session terminates after this duration regardless of activity.',
      ),
    ).toBeInTheDocument();
  });

  it('should allow changing the hard cap selection', async () => {
    useCeilingWithHardCap();

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    await selectOption(screen.getByLabelText('Hard Cap'), '8 hours');

    expect(screen.getByLabelText('Hard Cap')).toHaveTextContent('8');
  });

  it('should show custom hard cap input when Custom is selected', async () => {
    useCeilingWithHardCap();

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    await selectOption(screen.getByLabelText('Hard Cap'), 'Custom...');

    const customInput = screen.getByPlaceholderText('Hours');
    expect(customInput).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(customInput, '5');

    expect(customInput).toHaveValue(5);
  });

  it('should allow typing in the working directory field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Working Directory')).toBeInTheDocument();
    });

    const dirInput = screen.getByLabelText('Working Directory');
    await user.type(dirInput, '/tmp/work');

    expect(dirInput).toHaveValue('/tmp/work');
  });

  it('should display device policy source label', async () => {
    useCeilingWithHardCap();

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/device policy/)).toBeInTheDocument();
    });
  });

  it('should display organization policy source label', async () => {
    useOrgSourceCeiling();

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/organization policy/)).toBeInTheDocument();
    });
  });

  it('should display default working directory when device config has one', async () => {
    useDeviceConfigWithWorkingDirectory();

    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/\/opt\/app/)).toBeInTheDocument();
    });
  });

  it('should show Creating... text while mutation is pending', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
        ),
        () => {
          return new Promise(() => {
            // intentionally never resolves to keep pending state
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });
});

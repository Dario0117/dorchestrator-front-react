import { CreateTerminalSessionDialog } from '@components/terminal/create-terminal-session-dialog';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type CeilingSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigEffectiveByDeviceId']['responses']['200']['content']['application/json'];

type DeviceConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];

type CreateSessionSuccessResponse =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['201']['content']['application/json'];

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

function setupWithHardCap() {
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
              source: 'org',
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function setupWithDevicePolicy() {
  server.use(
    http.get<never, never, CeilingSuccessResponse>(
      buildBackendUrl(
        '/api/v1/{organizationId}/terminal/config/effective/{deviceId}',
      ),
      () => {
        return HttpResponse.json({
          responseData: {
            results: {
              effectiveInactivityCeilingMs: 3_600_000,
              effectiveHardCapCeilingMs: null,
              source: 'device',
            },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function setupWithDefaultWorkingDirectory() {
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
    expect(screen.getByPlaceholderText('/home/user')).toBeInTheDocument();
  });

  it('should show policy source as system default', async () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/system default/)).toBeInTheDocument();
    });
  });

  it('should show policy source as device policy', async () => {
    setupWithDevicePolicy();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/device policy/)).toBeInTheDocument();
    });
  });

  it('should show policy source as organization policy', async () => {
    setupWithHardCap();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/organization policy/)).toBeInTheDocument();
    });
  });

  it('should show hard cap section when ceiling has hard cap', async () => {
    setupWithHardCap();
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

  it('should not show hard cap section when ceiling has no hard cap', async () => {
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    expect(screen.queryByText('Hard Cap')).not.toBeInTheDocument();
  });

  it('should show custom inactivity input when custom is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));

    expect(screen.getByPlaceholderText('Minutes')).toBeInTheDocument();
  });

  it('should show custom hard cap input when custom is selected', async () => {
    setupWithHardCap();
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /hard cap/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));

    expect(screen.getByPlaceholderText('Hours')).toBeInTheDocument();
  });

  it('should show inactivity preset options filtered by ceiling', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));

    // Default ceiling is 3_600_000 (1 hour), so 15min and 30min presets should be visible
    expect(
      screen.getByRole('option', { name: /15 minutes/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /30 minutes/ }),
    ).toBeInTheDocument();
    // "1 hour" appears twice: once in "Max (1 hour)" and once as a preset
    const hourOptions = screen.getAllByRole('option', { name: /1 hour/ });
    expect(hourOptions).toHaveLength(2);
    // 2 hours should not be available (exceeds 1 hour ceiling)
    expect(
      screen.queryByRole('option', { name: /^2 hours$/ }),
    ).not.toBeInTheDocument();
  });

  it('should show validation error for empty custom inactivity', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(
        screen.getByText('Inactivity timeout must be at least 1 minute'),
      ).toBeInTheDocument();
    });
  });

  it('should show validation error when custom inactivity exceeds ceiling', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));

    const minutesInput = screen.getByPlaceholderText('Minutes');
    await user.type(minutesInput, '120');

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(
        screen.getByText(/Inactivity timeout cannot exceed/),
      ).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid working directory', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Working Directory')).toBeInTheDocument();
    });

    const workingDirInput = screen.getByPlaceholderText('/home/user');
    await user.type(workingDirInput, 'relative/path');

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Working directory must be an absolute path (starting with /)',
        ),
      ).toBeInTheDocument();
    });
  });

  it('should show validation error for empty custom hard cap', async () => {
    setupWithHardCap();
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /hard cap/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(
        screen.getByText('Hard cap must be at least 1 hour'),
      ).toBeInTheDocument();
    });
  });

  it('should show validation error when custom hard cap exceeds ceiling', async () => {
    setupWithHardCap();
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox', { name: /hard cap/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));

    const hoursInput = screen.getByPlaceholderText('Hours');
    await user.type(hoursInput, '48');

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByText(/Hard cap cannot exceed/)).toBeInTheDocument();
    });
  });

  it('should clear error when changing inactivity selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Inactivity Timeout')).toBeInTheDocument();
    });

    // Trigger a validation error first
    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));
    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Change selection to clear error
    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));
    await user.click(screen.getByRole('option', { name: /Max/ }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should clear error when typing in working directory', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Working Directory')).toBeInTheDocument();
    });

    const workingDirInput = screen.getByPlaceholderText('/home/user');
    await user.type(workingDirInput, 'bad');
    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    await user.clear(workingDirInput);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

  it('should show Creating... text while mutation is pending', async () => {
    server.use(
      http.post<never, never, CreateSessionSuccessResponse>(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
        ),
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(
            {
              responseData: {
                results: {
                  id: 1,
                  sessionToken: 'mock-session-token',
                  deviceId: 1,
                  status: 'active',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  createdAt: new Date().toISOString(),
                },
              },
              responseErrors: null,
            },
            { status: 201 },
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

    expect(screen.getByText('Creating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(defaultProps.onSessionCreated).toHaveBeenCalled();
    });
  });

  it('should disable Start Session button while loading', () => {
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

    expect(screen.getByText('Start Session')).toBeDisabled();
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

  it('should show default error message when API returns no nonFieldErrors', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
        ),
        () => {
          return HttpResponse.json(
            {
              responseData: null,
              responseErrors: {},
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
      expect(
        screen.getByText(
          'Failed to create terminal session. Please try again.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('should display default working directory in placeholder when available', async () => {
    setupWithDefaultWorkingDirectory();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('/opt/app')).toBeInTheDocument();
    });

    expect(screen.getByText(/\(\/opt\/app\)/)).toBeInTheDocument();
  });

  it('should submit with working directory when provided', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Working Directory')).toBeInTheDocument();
    });

    const workingDirInput = screen.getByPlaceholderText('/home/user');
    await user.type(workingDirInput, '/var/data');

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(defaultProps.onSessionCreated).toHaveBeenCalledWith(1);
    });
  });

  it('should show validation error when inactivity exceeds hard cap', async () => {
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
                effectiveHardCapCeilingMs: 3_600_000,
                source: 'org',
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateTerminalSessionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hard Cap')).toBeInTheDocument();
    });

    // Set hard cap to custom 1 hour
    await user.click(screen.getByRole('combobox', { name: /hard cap/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));
    const hoursInput = screen.getByPlaceholderText('Hours');
    await user.type(hoursInput, '1');

    // Set inactivity to custom 90 minutes (exceeds 1 hour hard cap)
    await user.click(screen.getByRole('combobox', { name: /inactivity/i }));
    await user.click(screen.getByRole('option', { name: /Custom/ }));
    const minutesInput = screen.getByPlaceholderText('Minutes');
    await user.type(minutesInput, '90');

    await user.click(screen.getByText('Start Session'));

    await waitFor(() => {
      expect(
        screen.getByText('Inactivity timeout cannot exceed the hard cap'),
      ).toBeInTheDocument();
    });
  });

  it('should disable Cancel button while mutation is pending', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
        ),
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return HttpResponse.json(
            {
              responseData: {
                results: {
                  id: 1,
                  sessionToken: 'mock-session-token',
                  deviceId: 1,
                  status: 'active',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  createdAt: new Date().toISOString(),
                },
              },
              responseErrors: null,
            },
            { status: 201 },
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

    expect(screen.getByText('Cancel')).toBeDisabled();

    await waitFor(() => {
      expect(defaultProps.onSessionCreated).toHaveBeenCalled();
    });
  });
});

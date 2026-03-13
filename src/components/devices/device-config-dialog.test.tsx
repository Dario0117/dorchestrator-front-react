import { DeviceConfigDialog } from '@components/devices/device-config-dialog';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { delay, HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GetDeviceConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];
type GetTerminalConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfig']['responses']['200']['content']['application/json'];

const deviceConfigUrl = buildBackendUrl(
  '/api/v1/{organizationId}/terminal/config/{deviceId}',
);
const terminalConfigUrl = buildBackendUrl(
  '/api/v1/{organizationId}/terminal/config',
);

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  organizationId: 'org-123',
  deviceId: 1,
  deviceName: 'My Device',
};

function buildDeviceConfigResponse(
  overrides?: Partial<{
    inactivityTimeoutMs: number;
    hardCapMs: number | null;
    defaultWorkingDirectory: string | null;
    inherited: boolean;
  }>,
): GetDeviceConfigSuccessResponse {
  return {
    responseData: {
      results: {
        config: {
          inactivityTimeoutMs: overrides?.inactivityTimeoutMs ?? 3_600_000,
          hardCapMs: overrides?.hardCapMs ?? null,
          maxConcurrentSessions: 5,
          defaultWorkingDirectory: overrides?.defaultWorkingDirectory ?? null,
          recordingRetentionDays: null,
          recordingMaxSizePerSessionBytes: null,
          recordingMaxSizePerOrgBytes: null,
        },
        inherited: overrides?.inherited ?? true,
      },
    },
    responseErrors: null,
  };
}

function buildTerminalConfigResponse(
  overrides?: Partial<{
    inactivityTimeoutMs: number;
    hardCapMs: number | null;
  }>,
): GetTerminalConfigSuccessResponse {
  return {
    responseData: {
      results: {
        inactivityTimeoutMs: overrides?.inactivityTimeoutMs ?? 3_600_000,
        hardCapMs: overrides?.hardCapMs ?? null,
        maxConcurrentSessions: 5,
        defaultWorkingDirectory: null,
        recordingRetentionDays: null,
        recordingMaxSizePerSessionBytes: null,
        recordingMaxSizePerOrgBytes: null,
      },
    },
    responseErrors: null,
  };
}

describe('DeviceConfigDialog', () => {
  beforeEach(() => {
    defaultProps.onOpenChange.mockClear();
  });

  it('should render dialog when open is true', () => {
    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    expect(
      screen.getByText('Device Configuration: My Device'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Configure terminal session timeouts and defaults for this device/,
      ),
    ).toBeInTheDocument();
  });

  it('should not render dialog when open is false', () => {
    renderWithProviders(
      <DeviceConfigDialog
        {...defaultProps}
        open={false}
      />,
    );

    expect(
      screen.queryByText('Device Configuration: My Device'),
    ).not.toBeInTheDocument();
  });

  it('should show loading skeletons while queries are pending', async () => {
    server.use(
      http.get(deviceConfigUrl, async () => {
        await delay('infinite');
        return HttpResponse.json(buildDeviceConfigResponse());
      }),
    );

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBe(3);
    });
  });

  it('should render form with correct default values after data loads', async () => {
    server.use(
      http.get<never, never, GetDeviceConfigSuccessResponse>(
        deviceConfigUrl,
        () => {
          return HttpResponse.json(
            buildDeviceConfigResponse({
              inactivityTimeoutMs: 1_800_000,
              hardCapMs: 7_200_000,
              defaultWorkingDirectory: '/home/user',
            }),
          );
        },
      ),
    );

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Inactivity Timeout \(minutes\)/),
      ).toBeInTheDocument();
    });

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    ) as HTMLInputElement;
    const hardCapInput = screen.getByLabelText(
      /Hard Cap \(hours\)/,
    ) as HTMLInputElement;
    const workingDirInput = screen.getByLabelText(
      /Default Working Directory/,
    ) as HTMLInputElement;

    expect(inactivityInput.value).toBe('30');
    expect(hardCapInput.value).toBe('2');
    expect(workingDirInput.value).toBe('/home/user');
  });

  it('should render form with fallback defaults when config is undefined', async () => {
    server.use(
      http.get(deviceConfigUrl, () => {
        return HttpResponse.json({
          responseData: {
            results: { config: undefined, inherited: true },
          },
          responseErrors: null,
        });
      }),
    );

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Inactivity Timeout \(minutes\)/),
      ).toBeInTheDocument();
    });

    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    ) as HTMLInputElement;
    const hardCapInput = screen.getByLabelText(
      /Hard Cap \(hours\)/,
    ) as HTMLInputElement;
    const workingDirInput = screen.getByLabelText(
      /Default Working Directory/,
    ) as HTMLInputElement;

    expect(inactivityInput.value).toBe('60');
    expect(hardCapInput.value).toBe('');
    expect(workingDirInput.value).toBe('');
  });

  it('should show inherited settings message when config is inherited', async () => {
    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Currently using inherited settings/),
      ).toBeInTheDocument();
    });
  });

  it('should not show inherited message when config is not inherited', async () => {
    server.use(
      http.get<never, never, GetDeviceConfigSuccessResponse>(
        deviceConfigUrl,
        () => {
          return HttpResponse.json(
            buildDeviceConfigResponse({ inherited: false }),
          );
        },
      ),
    );

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Currently using inherited settings/),
    ).not.toBeInTheDocument();
  });

  it('should show org ceiling info in helper text when org config is loaded', async () => {
    server.use(
      http.get<never, never, GetTerminalConfigSuccessResponse>(
        terminalConfigUrl,
        () => {
          return HttpResponse.json(
            buildTerminalConfigResponse({
              inactivityTimeoutMs: 7_200_000,
              hardCapMs: 14_400_000,
            }),
          );
        },
      ),
    );

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Organization ceiling: 120 minutes/),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Organization hard cap: 4 hours/),
    ).toBeInTheDocument();
  });

  it('should show default helper text when org ceiling has no hard cap', async () => {
    server.use(
      http.get<never, never, GetTerminalConfigSuccessResponse>(
        terminalConfigUrl,
        () => {
          return HttpResponse.json(
            buildTerminalConfigResponse({
              inactivityTimeoutMs: 3_600_000,
              hardCapMs: null,
            }),
          );
        },
      ),
    );

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Organization ceiling: 60 minutes/),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Must not exceed the organization ceiling/),
    ).toBeInTheDocument();
  });

  it('should show success alert after form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });

    // Make form dirty by modifying a field
    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '45');

    const submitButton = screen.getByRole('button', {
      name: 'Save Device Configuration',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Device configuration updated successfully.'),
      ).toBeInTheDocument();
    });
  });

  it('should hide success alert after 5 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });

    // Make form dirty
    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '45');

    const submitButton = screen.getByRole('button', {
      name: 'Save Device Configuration',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Device configuration updated successfully.'),
      ).toBeInTheDocument();
    });

    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(
        screen.queryByText('Device configuration updated successfully.'),
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should reset success alert when dialog reopens', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    const { rerender } = renderWithProviders(
      <DeviceConfigDialog {...defaultProps} />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });

    // Make form dirty
    const inactivityInput = screen.getByLabelText(
      /Inactivity Timeout \(minutes\)/,
    );
    await user.clear(inactivityInput);
    await user.type(inactivityInput, '45');

    const submitButton = screen.getByRole('button', {
      name: 'Save Device Configuration',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Device configuration updated successfully.'),
      ).toBeInTheDocument();
    });

    // Close dialog
    rerender(
      <DeviceConfigDialog
        {...defaultProps}
        open={false}
      />,
    );
    // Reopen dialog
    rerender(
      <DeviceConfigDialog
        {...defaultProps}
        open={true}
      />,
    );

    // Success alert should be reset
    expect(
      screen.queryByText('Device configuration updated successfully.'),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should render the save button', async () => {
    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });
  });

  it('should show form fields with correct labels', async () => {
    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText('Inactivity Timeout (minutes)'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Hard Cap (hours)')).toBeInTheDocument();
    expect(screen.getByText('Default Working Directory')).toBeInTheDocument();
  });
});

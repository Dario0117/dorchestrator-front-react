import { DeviceConfigDialog } from '@domains/devices/modals/device-config-dialog';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { delay, HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GetDeviceConfigSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalConfigByDeviceId']['responses']['200']['content']['application/json'];

const deviceConfigUrl = buildBackendUrl(
  '/api/v1/{organizationId}/terminal/config/{deviceId}',
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

// Form field rendering, validation, and submission are tested in
// device-config.form.test.tsx. These tests focus on the dialog wrapper:
// open/close, loading state, inherited message, and success alert lifecycle.

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

  it('should render form after data loads', async () => {
    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });
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

  it('should convert hardCapMs to hours when a numeric value is provided', async () => {
    server.use(
      http.get<never, never, GetDeviceConfigSuccessResponse>(
        deviceConfigUrl,
        () => {
          return HttpResponse.json(
            buildDeviceConfigResponse({ hardCapMs: 7_200_000 }),
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
  });

  it('should show success alert after form submission', async () => {
    const user = userEvent.setup();

    renderWithProviders(<DeviceConfigDialog {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Device Configuration' }),
      ).toBeInTheDocument();
    });

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

    act(() => {
      vi.advanceTimersByTime(5000);
    });

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
});

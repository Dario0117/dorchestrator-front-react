import { DeviceSandboxConfig } from '@domains/sandbox/components/device-sandbox-config';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import {
  clickTrigger,
  renderWithProviders,
  selectOption,
} from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

type DeviceSandboxConfigProps = {
  organizationId: string;
  deviceId: number;
  effectivePresetId?: number | null;
  effectivePresetName?: string | null;
};

const defaultProps: DeviceSandboxConfigProps = {
  organizationId: 'org-123',
  deviceId: 42,
  effectivePresetId: 1,
  effectivePresetName: 'Default Docker',
};

function renderComponent(overrides?: Partial<DeviceSandboxConfigProps>) {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <DeviceSandboxConfig
        {...defaultProps}
        {...overrides}
      />
    </Suspense>,
  );
}

describe('DeviceSandboxConfig', () => {
  it('renders the card with title and description', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        /Override the organization default sandbox preset for this device/,
      ),
    ).toBeInTheDocument();
  });

  it('shows current effective preset name when provided', async () => {
    renderComponent({ effectivePresetName: 'Default Docker' });
    await waitFor(() => {
      expect(
        screen.getByText(/Current effective preset: Default Docker/),
      ).toBeInTheDocument();
    });
  });

  it('does not show effective preset text when effectivePresetName is not provided', async () => {
    renderComponent({
      effectivePresetId: undefined,
      effectivePresetName: undefined,
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/Current effective preset/),
    ).not.toBeInTheDocument();
  });

  it('renders preset options in the select dropdown', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });
    const trigger = screen.getByRole('combobox');
    await clickTrigger(trigger);
    await waitFor(() => {
      expect(
        screen.getByRole('option', {
          name: 'Default Docker (org default)',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: 'Restricted Docker - requires approval',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: 'No Sandbox - requires approval',
        }),
      ).toBeInTheDocument();
    });
  });

  it('initializes selected preset from effectivePresetId', async () => {
    renderComponent({ effectivePresetId: 1 });
    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });
  });

  it('initializes with empty selection when effectivePresetId is undefined', async () => {
    renderComponent({
      effectivePresetId: undefined,
      effectivePresetName: undefined,
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });
    expect(screen.getByText('Select a preset')).toBeInTheDocument();
  });

  it('calls setDeviceDefaultPreset mutation on Save click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('does nothing on Save when no preset is selected', async () => {
    renderComponent({
      effectivePresetId: null,
      effectivePresetName: null,
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('calls clearDeviceDefaultPreset mutation on Clear Override click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear Override' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('shows success message and hides it after 5 seconds on Save', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    await act(() => vi.advanceTimersByTime(5000));

    await waitFor(() => {
      expect(
        screen.queryByText('Device sandbox preset updated.'),
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('shows success message and hides after 5 seconds on Clear Override', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear Override' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    await act(() => vi.advanceTimersByTime(5000));

    await waitFor(() => {
      expect(
        screen.queryByText('Device sandbox preset updated.'),
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('clears previous success timeout when saving again', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    // First save
    await clickTrigger(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    // Advance partially
    await act(() => vi.advanceTimersByTime(3000));

    // Second save — resets the timeout
    await clickTrigger(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeEnabled();
    });

    // Advance past original 5s but not past second 5s
    await act(() => vi.advanceTimersByTime(3000));

    expect(
      screen.getByText('Device sandbox preset updated.'),
    ).toBeInTheDocument();

    // Complete the second timeout
    await act(() => vi.advanceTimersByTime(2000));

    await waitFor(() => {
      expect(
        screen.queryByText('Device sandbox preset updated.'),
      ).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('resets selected preset to org default on Clear Override success', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // Start with a non-default preset selected
    renderComponent({
      effectivePresetId: 2,
      effectivePresetName: 'Restricted Docker',
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    // Verify current selection shows Restricted Docker
    expect(screen.getByText('Restricted Docker')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear Override' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    // After clear, should reset to org default (Default Docker, id=1)
    await waitFor(() => {
      expect(screen.getByText('Default Docker')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('resets selected preset to empty when no org default exists on Clear Override', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Override handler to return presets with no org default
    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 10,
                  organizationId: 'org-123',
                  name: 'Custom Preset',
                  description: 'A preset',
                  sandboxTypeId: 2,
                  networkPolicy: null,
                  resourceLimits: null,
                  volumeMounts: null,
                  pluginConfig: null,
                  isOrgDefault: false,
                  requiresApproval: false,
                  createdBy: 'user-123',
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z',
                },
              ],
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent({
      effectivePresetId: 10,
      effectivePresetName: 'Custom Preset',
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear Override' }));

    await waitFor(() => {
      expect(
        screen.getByText('Device sandbox preset updated.'),
      ).toBeInTheDocument();
    });

    // After clear with no org default, placeholder should show
    await waitFor(() => {
      expect(screen.getByText('Select a preset')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('changes the selected preset when a different option is chosen', async () => {
    renderComponent({
      effectivePresetId: 1,
      effectivePresetName: 'Default Docker',
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    const trigger = screen.getByRole('combobox');
    await selectOption(trigger, 'Restricted Docker - requires approval');

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent(
        'Restricted Docker',
      );
    });
  });

  it('early-returns from handleSave when selectedPresetId is empty', async () => {
    renderComponent({
      effectivePresetId: null,
      effectivePresetName: null,
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    // Walk the React fiber tree to find the component fiber that owns handleSave,
    // then invoke its onClick prop directly (bypassing base-ui's disabled guard)
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    const fiberKey = Object.keys(saveButton).find((key) =>
      key.startsWith('__reactFiber$'),
    );
    type Fiber = {
      return: Fiber | null;
      memoizedProps: Record<string, unknown> | null;
      pendingProps: Record<string, unknown> | null;
    };
    let fiber = fiberKey
      ? (saveButton as unknown as Record<string, Fiber>)[fiberKey]
      : null;
    // Walk up until we find a fiber whose onClick is our handleSave (not base-ui's wrapper).
    // The component-level Button fiber has onClick=handleSave and disabled=true|expression
    const onClickFns: Array<(e: MouseEvent) => void> = [];
    while (fiber) {
      const props = (fiber.pendingProps ?? fiber.memoizedProps) as Record<
        string,
        unknown
      > | null;
      if (props?.onClick && typeof props.onClick === 'function') {
        onClickFns.push(props.onClick as (e: MouseEvent) => void);
      }
      fiber = fiber.return;
    }

    // The last onClick in the chain (furthest ancestor) is the one from our component
    const handleSave = onClickFns[onClickFns.length - 1];
    expect(handleSave).toBeDefined();
    await act(() => {
      handleSave!(new MouseEvent('click', { bubbles: true }));
    });

    // handleSave returns early because selectedPresetId is empty
    expect(
      screen.queryByText('Device sandbox preset updated.'),
    ).not.toBeInTheDocument();
  });

  it('does not update selectedPresetId when onValueChange receives null', async () => {
    renderComponent({
      effectivePresetId: 1,
      effectivePresetName: 'Default Docker',
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });

    // Walk the React fiber tree from the select trigger to find the onValueChange
    // on the Select component, then call it with null to exercise the else branch
    const trigger = screen.getByRole('combobox');
    const fiberKey = Object.keys(trigger).find((key) =>
      key.startsWith('__reactFiber$'),
    );
    type Fiber = {
      return: Fiber | null;
      memoizedProps: Record<string, unknown> | null;
      pendingProps: Record<string, unknown> | null;
    };
    let fiber = fiberKey
      ? (trigger as unknown as Record<string, Fiber>)[fiberKey]
      : null;
    let onValueChange: ((val: string | null) => void) | undefined;
    while (fiber) {
      const props = (fiber.pendingProps ?? fiber.memoizedProps) as Record<
        string,
        unknown
      > | null;
      if (props?.onValueChange && typeof props.onValueChange === 'function') {
        onValueChange = props.onValueChange as (val: string | null) => void;
        break;
      }
      fiber = fiber.return;
    }
    expect(onValueChange).toBeDefined();

    // Call with null to exercise the else branch of the null guard
    await act(() => {
      onValueChange!(null);
    });

    // Selection should remain unchanged (still Default Docker)
    expect(screen.getByRole('combobox')).toHaveTextContent('Default Docker');
  });

  it('handles responseData being null gracefully', async () => {
    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent({
      effectivePresetId: null,
      effectivePresetName: null,
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });
    // With null responseData, presets should be empty and Save disabled
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('handles empty presets list gracefully', async () => {
    server.use(
      http.get(
        buildBackendUrl('/api/v1/{organizationId}/sandbox/presets'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderComponent({
      effectivePresetId: null,
      effectivePresetName: null,
    });
    await waitFor(() => {
      expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

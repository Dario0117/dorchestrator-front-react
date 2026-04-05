import { SandboxSelector } from '@domains/sandbox/components/sandbox-selector';
import type { SandboxPresetItem } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import { renderWithProviders, selectOption } from '@lib/test-wrappers.utils';
import { act, screen } from '@testing-library/react';

const basePreset: SandboxPresetItem = {
  id: 1,
  organizationId: 'org-1',
  name: 'Default Preset',
  description: null,
  sandboxTypeId: 1,
  providerConfig: null,
  isOrgDefault: false,
  requiresApproval: false,
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const presets: SandboxPresetItem[] = [
  { ...basePreset, id: 1, name: 'Standard' },
  {
    ...basePreset,
    id: 2,
    name: 'Restricted',
    requiresApproval: true,
    isOrgDefault: true,
  },
  { ...basePreset, id: 3, name: 'Open', isOrgDefault: false },
];

describe('SandboxSelector', () => {
  it('renders the label and current preset name', () => {
    renderWithProviders(
      <SandboxSelector
        value={1}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    expect(screen.getByText('Sandbox Preset')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('calls onChange with the numeric id when a different preset is selected', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SandboxSelector
        value={1}
        onChange={onChange}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await selectOption(trigger, 'Restricted - requires approval');

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('shows override message when value differs from effectivePresetId and preset does not require approval', () => {
    renderWithProviders(
      <SandboxSelector
        value={3}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    expect(
      screen.getByText('Different from device default preset.'),
    ).toBeInTheDocument();
  });

  it('shows approval message when overriding with a preset that requires approval', () => {
    renderWithProviders(
      <SandboxSelector
        value={2}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    expect(
      screen.getByText(
        'Requires admin approval — this preset requires approval to use.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the Default badge when overriding with an org-default preset', () => {
    renderWithProviders(
      <SandboxSelector
        value={2}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('does not show override messages or badge when value matches effectivePresetId', () => {
    renderWithProviders(
      <SandboxSelector
        value={1}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    expect(
      screen.queryByText('Different from device default preset.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Requires admin approval — this preset requires approval to use.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Default')).not.toBeInTheDocument();
  });

  it('renders nothing for the selected name when value does not match any preset', () => {
    renderWithProviders(
      <SandboxSelector
        value={999}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    // The trigger should still be present but without a preset name
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByText('Standard')).not.toBeInTheDocument();
    expect(screen.queryByText('Restricted')).not.toBeInTheDocument();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  it('does not show approval or default badge when value is unmatched and is override', () => {
    renderWithProviders(
      <SandboxSelector
        value={999}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    // isOverride is true (999 !== 1), but selectedPreset is undefined
    // so requiresApproval and isOrgDefault are falsy
    expect(
      screen.queryByText(
        'Requires admin approval — this preset requires approval to use.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Default')).not.toBeInTheDocument();
  });

  it('does not call onChange when the select is opened and dismissed without choosing', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SandboxSelector
        value={1}
        onChange={onChange}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    const trigger = screen.getByRole('combobox');
    const { clickTrigger } = await import('@lib/test-wrappers.utils');
    await clickTrigger(trigger);

    // Press Escape to close without selecting
    const user = (await import('@testing-library/user-event')).default.setup();
    await user.keyboard('{Escape}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects the disabled prop', () => {
    renderWithProviders(
      <SandboxSelector
        value={1}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={1}
        presets={presets}
        disabled
      />,
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('does not call onChange when onValueChange receives null', () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SandboxSelector
        value={1}
        onChange={onChange}
        effectivePresetId={1}
        presets={presets}
      />,
    );

    // Walk the React fiber tree to find the onValueChange handler on the Select
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

    act(() => {
      onValueChange!(null);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows preset items with correct labels when opened', async () => {
    renderWithProviders(
      <SandboxSelector
        value={1}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
        onChange={() => {}}
        effectivePresetId={2}
        presets={presets}
      />,
    );

    const trigger = screen.getByRole('combobox');
    const { clickTrigger } = await import('@lib/test-wrappers.utils');
    await clickTrigger(trigger);

    // effectivePresetId=2, so preset 2 gets " (default)" suffix
    expect(
      screen.getByRole('option', { name: 'Standard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'Restricted (default) - requires approval',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Open' })).toBeInTheDocument();
  });
});

import { CustomShortcutButton } from '@domains/terminal/components/custom-shortcut-button';
import type { CustomShortcut } from '@domains/terminal/components/terminal-shortcut-panel.types';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const createCustomShortcut = (
  overrides: Partial<CustomShortcut> = {},
): CustomShortcut => ({
  id: 1,
  label: 'Deploy',
  keySequence: 'deploy --prod',
  mode: 'keystroke',
  color: null,
  sortOrder: 0,
  ...overrides,
});

describe('CustomShortcutButton', () => {
  const defaultShortcut = createCustomShortcut();

  it('renders the shortcut label', () => {
    renderWithProviders(
      <CustomShortcutButton
        shortcut={defaultShortcut}
        onPress={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('calls onPress when the button is clicked', async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CustomShortcutButton
        shortcut={defaultShortcut}
        onPress={onPress}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByTestId('custom-shortcut-btn-1'));
    expect(onPress).toHaveBeenCalledWith(defaultShortcut);
  });

  it('has Edit and Delete options in the dropdown menu', async () => {
    renderWithProviders(
      <CustomShortcutButton
        shortcut={defaultShortcut}
        onPress={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await clickTrigger(screen.getByTestId('custom-shortcut-menu-1'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CustomShortcutButton
        shortcut={defaultShortcut}
        onPress={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await clickTrigger(screen.getByTestId('custom-shortcut-menu-1'));
    await user.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(defaultShortcut);
  });

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CustomShortcutButton
        shortcut={defaultShortcut}
        onPress={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await clickTrigger(screen.getByTestId('custom-shortcut-menu-1'));
    await user.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});

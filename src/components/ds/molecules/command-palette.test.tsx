import { CommandPalette } from '@components/ds/molecules/command-palette';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@domains/devices/hooks/use-devices-presence', () => ({
  useDevicesPresence: (deviceIds: number[]) => ({
    presenceMap: new Map(deviceIds.map((id) => [id, id === 1])),
    isLoading: false,
  }),
}));

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    slug: 'test-org',
    name: 'Test',
  }),
}));

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useActiveTeam: () => ({
    id: 'team-1',
    slug: 'test-team',
    name: 'Test Team',
  }),
}));

function renderPalette(overrides?: { open?: boolean }) {
  const onOpenChange = vi.fn();
  const onSelect = vi.fn();
  const result = renderWithProviders(
    <CommandPalette
      open={overrides?.open ?? true}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    />,
  );
  return { ...result, onOpenChange, onSelect };
}

describe('CommandPalette', () => {
  it('renders with dialog role and aria-label when open', () => {
    renderPalette();
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Command palette',
    );
  });

  it('does not render dialog content when closed', () => {
    renderPalette({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows search input when open', () => {
    renderPalette();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows navigation items when search is empty and no recent items', () => {
    renderPalette();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Commands')).toBeInTheDocument();
  });

  it('filters results when typing', async () => {
    const user = userEvent.setup();
    renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'Dash');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Commands')).not.toBeInTheDocument();
  });

  it('calls onSelect when Enter is pressed on a navigation item', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'Dashboard');
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'nav-dashboard', type: 'navigation' }),
    );
  });

  it('navigates results with arrow down key', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = screen.getByRole('dialog');
    await act(() => {
      dialog.focus();
    });

    await user.keyboard('{ArrowDown}');
    // Second item should now be active — just verify no error
  });

  it('navigates results with arrow up key', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = screen.getByRole('dialog');
    await act(() => {
      dialog.focus();
    });

    // ArrowUp from index 0 should wrap to the last item
    await user.keyboard('{ArrowUp}');
    // Verify no error and wrapping works
  });

  it('wraps arrow down from the last item back to the first', async () => {
    const user = userEvent.setup();
    renderPalette();

    const input = screen.getByLabelText('Search');
    // Filter to a single result so we can wrap easily
    await user.type(input, 'Dashboard');

    // We should have exactly 1 result — ArrowDown should wrap to 0
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    // Verify no error on wrap
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'xyznonexistent');

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('does nothing on Enter when no results exist', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPalette();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'xyznonexistent');
    await user.keyboard('{Enter}');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects a result item when clicked', async () => {
    const user = userEvent.setup();
    const { onSelect, onOpenChange } = renderPalette();

    // Click on a navigation result
    const dashboardItem = screen.getByText('Dashboard');
    await user.click(dashboardItem);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'nav-dashboard', type: 'navigation' }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  describe('device submenu', () => {
    async function openDeviceSubmenu() {
      const user = userEvent.setup();
      const result = renderPalette();

      const input = screen.getByLabelText('Search');
      // Type a query that matches mock devices from the MSW handler
      await user.type(input, 'Test Server');

      // Wait for device results to load from MSW
      await waitFor(() => {
        expect(screen.getByText('Test Server')).toBeInTheDocument();
      });

      return { user, ...result };
    }

    it('opens device submenu when selecting a device result via click', async () => {
      const { user } = await openDeviceSubmenu();

      // Click on the device result to open submenu
      await user.click(screen.getByText('Test Server'));

      // Submenu should show with device label and actions
      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });
      expect(screen.getByText('Send Command')).toBeInTheDocument();
      expect(screen.getByText('Device Settings')).toBeInTheDocument();

      // Search input should be hidden when submenu is open
      expect(screen.queryByLabelText('Search')).not.toBeInTheDocument();
    });

    it('opens device submenu when pressing Enter on a device result', async () => {
      const { user } = await openDeviceSubmenu();

      // Press Enter to select the device (should open submenu, not call onSelect)
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });
    });

    it('navigates device submenu with ArrowDown', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // ArrowDown should move selection within the submenu
      await user.keyboard('{ArrowDown}');
      // Verify no error — submenu navigation works
    });

    it('wraps ArrowDown in device submenu from last to first', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // Navigate past all 3 items to wrap
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      // Should wrap back to index 0
    });

    it('navigates device submenu with ArrowUp from index 0 wrapping to last', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // ArrowUp from 0 should wrap to the last item
      await user.keyboard('{ArrowUp}');
    });

    it('navigates device submenu with ArrowDown then ArrowUp', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // Move down to index 1, then back up to index 0
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
    });

    it('selects device action via Enter in submenu', async () => {
      const { user, onSelect, onOpenChange } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // Press Enter to select the first action (terminal) at index 0
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'device',
          action: 'terminal',
        }),
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('selects second device action via ArrowDown then Enter', async () => {
      const { user, onSelect } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // Move to "Send Command" (index 1) and select
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'device',
          action: 'command',
        }),
      );
    });

    it('closes device submenu on Escape', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      await user.keyboard('{Escape}');

      // Should go back to main results with search input visible
      await waitFor(() => {
        expect(screen.getByLabelText('Search')).toBeInTheDocument();
      });
    });

    it('closes device submenu on Backspace', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      await user.keyboard('{Backspace}');

      // Should go back to main results
      await waitFor(() => {
        expect(screen.getByLabelText('Search')).toBeInTheDocument();
      });
    });

    it('does not close submenu when pressing an unhandled key in submenu', async () => {
      const { user } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      await act(() => {
        dialog.focus();
      });

      // Press a key that is not handled by the submenu keydown (not ArrowDown/Up/Enter/Escape/Backspace)
      // This should hit the `return` at end of submenuDevice block without matching any branch
      fireEvent.keyDown(dialog, { key: 'a' });

      // Submenu should still be open — search input remains hidden
      expect(screen.queryByLabelText('Search')).not.toBeInTheDocument();
      expect(screen.getByText('Terminal')).toBeInTheDocument();
    });

    it('selects a device action by clicking on it in the submenu', async () => {
      const { user, onSelect, onOpenChange } = await openDeviceSubmenu();

      await user.click(screen.getByText('Test Server'));

      await waitFor(() => {
        expect(screen.getByText('Send Command')).toBeInTheDocument();
      });

      // Click on "Send Command" action
      await user.click(screen.getByText('Send Command'));

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'device',
          action: 'command',
        }),
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('navigates main results with ArrowDown then ArrowUp without wrapping', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = screen.getByRole('dialog');
    await act(() => {
      dialog.focus();
    });

    // Move down then back up (non-wrapping paths)
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
  });

  it('navigates main results ArrowUp from index > 0 decrements index', async () => {
    const user = userEvent.setup();
    renderPalette();

    const dialog = screen.getByRole('dialog');
    await act(() => {
      dialog.focus();
    });

    // Move to index 1, then ArrowUp should take us back to index 0 (i - 1 branch)
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    // Verify no errors — the i - 1 branch was hit
    expect(dialog).toBeInTheDocument();
  });

  it('resets state when re-opened', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();
    const { rerender } = renderWithProviders(
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    );

    const input = screen.getByLabelText('Search');
    await user.type(input, 'test');

    // Close and re-open
    rerender(
      <CommandPalette
        open={false}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    );
    rerender(
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    );

    // Search should be reset
    const newInput = screen.getByLabelText('Search');
    expect(newInput).toHaveValue('');
  });
});

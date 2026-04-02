import type { CommandPaletteResult } from '@components/ds/molecules/command-palette.types';
import { CommandPaletteResultItem } from '@components/ds/molecules/command-palette-result-item';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const onlineDevice: CommandPaletteResult = {
  id: 'device-1',
  type: 'device',
  label: 'Online Server',
  isOnline: true,
};

const offlineDevice: CommandPaletteResult = {
  id: 'device-2',
  type: 'device',
  label: 'Offline Server',
  isOnline: false,
};

const deviceNeverConnected: CommandPaletteResult = {
  id: 'device-3',
  type: 'device',
  label: 'Unknown Device',
  isOnline: false,
};

const navigationItem: CommandPaletteResult = {
  id: 'nav-dashboard',
  type: 'navigation',
  label: 'Dashboard',
};

describe('CommandPaletteResultItem', () => {
  it('renders item label', () => {
    renderWithProviders(
      <CommandPaletteResultItem
        item={navigationItem}
        active={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not render status dot for non-device items', () => {
    renderWithProviders(
      <CommandPaletteResultItem
        item={navigationItem}
        active={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Online')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Offline')).not.toBeInTheDocument();
  });

  it('renders online status dot for online device', () => {
    renderWithProviders(
      <CommandPaletteResultItem
        item={onlineDevice}
        active={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Online')).toBeInTheDocument();
  });

  it('renders offline status dot for offline device', () => {
    renderWithProviders(
      <CommandPaletteResultItem
        item={offlineDevice}
        active={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Offline')).toBeInTheDocument();
  });

  it('renders offline status dot for never-connected device', () => {
    renderWithProviders(
      <CommandPaletteResultItem
        item={deviceNeverConnected}
        active={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Offline')).toBeInTheDocument();
  });

  it('sets aria-selected based on active prop', () => {
    renderWithProviders(
      <CommandPaletteResultItem
        item={navigationItem}
        active
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProviders(
      <CommandPaletteResultItem
        item={navigationItem}
        active={false}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByText('Dashboard'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('calls onSelect on Enter keydown', () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <CommandPaletteResultItem
        item={navigationItem}
        active={false}
        onSelect={onSelect}
      />,
    );
    fireEvent.keyDown(screen.getByRole('option'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not call onSelect on non-Enter keydown', () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <CommandPaletteResultItem
        item={navigationItem}
        active={false}
        onSelect={onSelect}
      />,
    );
    fireEvent.keyDown(screen.getByRole('option'), { key: 'Tab' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});

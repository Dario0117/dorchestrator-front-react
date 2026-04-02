import { CommandPaletteDeviceSubmenu } from '@components/ds/molecules/command-palette-device-submenu';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('CommandPaletteDeviceSubmenu', () => {
  const defaultProps = {
    deviceLabel: 'My Device',
    activeIndex: 0,
    onSelectAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the device label', () => {
    renderWithProviders(<CommandPaletteDeviceSubmenu {...defaultProps} />);
    expect(screen.getByText('My Device')).toBeInTheDocument();
  });

  it('renders all three device actions', () => {
    renderWithProviders(<CommandPaletteDeviceSubmenu {...defaultProps} />);
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Send Command')).toBeInTheDocument();
    expect(screen.getByText('Device Settings')).toBeInTheDocument();
  });

  it('sets aria-label on the listbox with the device label', () => {
    renderWithProviders(<CommandPaletteDeviceSubmenu {...defaultProps} />);
    expect(
      screen.getByRole('listbox', { name: 'Actions for My Device' }),
    ).toBeInTheDocument();
  });

  it('marks the active index item as aria-selected', () => {
    renderWithProviders(
      <CommandPaletteDeviceSubmenu
        {...defaultProps}
        activeIndex={1}
      />,
    );
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectAction with the correct action id on click', async () => {
    const user = userEvent.setup();
    const onSelectAction = vi.fn();
    renderWithProviders(
      <CommandPaletteDeviceSubmenu
        {...defaultProps}
        onSelectAction={onSelectAction}
      />,
    );
    await user.click(screen.getByText('Send Command'));
    expect(onSelectAction).toHaveBeenCalledWith('command');
  });

  it('calls onSelectAction on Enter keydown', () => {
    const onSelectAction = vi.fn();
    renderWithProviders(
      <CommandPaletteDeviceSubmenu
        {...defaultProps}
        onSelectAction={onSelectAction}
      />,
    );
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[2]!, { key: 'Enter' });
    expect(onSelectAction).toHaveBeenCalledWith('settings');
  });

  it('does not call onSelectAction on non-Enter keydown', () => {
    const onSelectAction = vi.fn();
    renderWithProviders(
      <CommandPaletteDeviceSubmenu
        {...defaultProps}
        onSelectAction={onSelectAction}
      />,
    );
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[0]!, { key: 'a' });
    expect(onSelectAction).not.toHaveBeenCalled();
  });
});

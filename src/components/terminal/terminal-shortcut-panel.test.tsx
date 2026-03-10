import { TerminalShortcutPanel } from '@components/terminal/terminal-shortcut-panel';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import {
  setDesktopViewport,
  setMobileViewport,
} from '@lib/viewport-test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('TerminalShortcutPanel', () => {
  const mockOnShortcutPress = vi.fn();
  const mockOnCustomShortcutPress = vi.fn();
  const mockOnAddShortcut = vi.fn();
  const mockOnEditShortcut = vi.fn();
  const mockOnDeleteShortcut = vi.fn();

  const defaultProps = {
    onShortcutPress: mockOnShortcutPress,
    onCustomShortcutPress: mockOnCustomShortcutPress,
    customShortcuts: [],
    onAddShortcut: mockOnAddShortcut,
    onEditShortcut: mockOnEditShortcut,
    onDeleteShortcut: mockOnDeleteShortcut,
  };

  beforeEach(() => {
    mockOnShortcutPress.mockClear();
    mockOnCustomShortcutPress.mockClear();
    mockOnAddShortcut.mockClear();
    mockOnEditShortcut.mockClear();
    mockOnDeleteShortcut.mockClear();
  });

  test('renders all preset shortcut buttons', () => {
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    expect(screen.getByTestId('shortcut-panel')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+D')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Z')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+L')).toBeInTheDocument();
    expect(screen.getByText('Tab')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  test('each button has correct aria-label', () => {
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Send interrupt signal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send end of file' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Suspend process' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Clear terminal screen' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tab completion' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Escape key' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Previous command' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Next command' }),
    ).toBeInTheDocument();
  });

  test('clicking Ctrl+C button calls onShortcutPress with correct sequence', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    await user.click(
      screen.getByRole('button', { name: 'Send interrupt signal' }),
    );
    expect(mockOnShortcutPress).toHaveBeenCalledWith('\x03');
  });

  test('clicking Tab button calls onShortcutPress with correct sequence', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Tab completion' }));
    expect(mockOnShortcutPress).toHaveBeenCalledWith('\t');
  });

  test('clicking Up arrow button calls onShortcutPress with correct sequence', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Previous command' }));
    expect(mockOnShortcutPress).toHaveBeenCalledWith('\x1b[A');
  });

  test('container has toolbar role and aria-label', () => {
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    const panel = screen.getByRole('toolbar', { name: 'Terminal shortcuts' });
    expect(panel).toBeInTheDocument();
  });

  test('all buttons have minimum touch target size (44px)', () => {
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    // 8 preset buttons + 1 Add button
    expect(buttons).toHaveLength(9);

    for (const button of buttons) {
      expect(button.className).toContain('min-w-11');
    }
  });

  test('container has mobile horizontal scroll classes', () => {
    setMobileViewport();
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    const panel = screen.getByTestId('shortcut-panel');
    // Mobile base: horizontal scroll with nowrap
    expect(panel.className).toContain('overflow-x-auto');
    expect(panel.className).toContain('flex-nowrap');
    // Desktop override: wrap and no overflow
    expect(panel.className).toContain('md:flex-wrap');
    expect(panel.className).toContain('md:overflow-visible');
  });

  test('buttons have responsive sizing classes for mobile and desktop', () => {
    setDesktopViewport();
    renderWithProviders(<TerminalShortcutPanel {...defaultProps} />);

    const buttons = screen.getAllByRole('button');

    for (const button of buttons) {
      // Mobile: 44px touch targets with 16px text (prevents iOS auto-zoom)
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('min-w-11');
      expect(button.className).toContain('text-base');
      // Desktop: compact sizing
      expect(button.className).toContain('md:h-9');
      expect(button.className).toContain('md:min-w-9');
      expect(button.className).toContain('md:text-sm');
    }
  });
});

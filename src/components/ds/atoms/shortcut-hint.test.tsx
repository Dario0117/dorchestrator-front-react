import { ShortcutHint } from '@components/ds/atoms/shortcut-hint';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('ShortcutHint', () => {
  it('renders the key text', () => {
    renderWithProviders(<ShortcutHint keys="N" />);
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('renders as a kbd element', () => {
    renderWithProviders(<ShortcutHint keys="N" />);
    expect(screen.getByText('N').tagName).toBe('KBD');
  });

  it('replaces Mod with platform-appropriate label', () => {
    renderWithProviders(<ShortcutHint keys="Mod+K" />);
    // In jsdom, navigator.platform defaults to empty string (non-Mac)
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('renders compound keys', () => {
    renderWithProviders(<ShortcutHint keys="Mod+Shift+S" />);
    expect(screen.getByText('Ctrl+Shift+S')).toBeInTheDocument();
  });

  it('renders keys without Mod unchanged', () => {
    renderWithProviders(<ShortcutHint keys="Escape" />);
    expect(screen.getByText('Escape')).toBeInTheDocument();
  });
});

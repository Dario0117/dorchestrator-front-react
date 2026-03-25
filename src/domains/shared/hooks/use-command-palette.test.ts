import type { CommandPaletteResult } from '@components/ds/molecules/command-palette.types';
import { useCommandPalette } from '@domains/shared/hooks/use-command-palette';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { useHotkey } from '@tanstack/react-hotkeys';
import { act, renderHook } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn<() => Record<string, string>>(() => ({
  organizationSlug: 'test-org',
  teamSlug: 'default',
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  }),
}));

vi.mock('@tanstack/react-hotkeys', () => ({
  useHotkey: vi.fn(),
}));

const mockUseHotkey = vi.mocked(useHotkey);

describe('useCommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({
      organizationSlug: 'test-org',
      teamSlug: 'default',
    });
  });

  it('should return open state, setOpen, and handleSelect', () => {
    const { result } = renderHook(() => useCommandPalette(), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(result.current.open).toBe(false);
    expect(typeof result.current.setOpen).toBe('function');
    expect(typeof result.current.handleSelect).toBe('function');
  });

  it('should toggle open state via hotkey callback', () => {
    const { result } = renderHook(() => useCommandPalette(), {
      wrapper: createQueryThemeWrapper(),
    });

    // Find the Mod+K handler registration
    const modKCall = mockUseHotkey.mock.calls.find(
      (call) => call[0] === 'Mod+K',
    );
    expect(modKCall).toBeDefined();

    // biome-ignore lint/style/noNonNullAssertion: test assertion — modKCall is verified by expect above
    const hotkeyHandler = modKCall![1];
    const fakeEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent;

    act(() => {
      hotkeyHandler(fakeEvent, { hotkey: 'Mod+K' } as never);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      hotkeyHandler(fakeEvent, { hotkey: 'Mod+K' } as never);
    });
    expect(result.current.open).toBe(false);
  });

  it('should toggle open state via setOpen', () => {
    const { result } = renderHook(() => useCommandPalette(), {
      wrapper: createQueryThemeWrapper(),
    });

    act(() => {
      result.current.setOpen(true);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.setOpen(false);
    });
    expect(result.current.open).toBe(false);
  });

  describe('handleSelect - navigation type', () => {
    it('should navigate to org route for nav-audit-logs', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-audit-logs',
          label: 'Audit Logs',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/audit-logs',
        params: { organizationSlug: 'test-org' },
      });
    });

    it('should navigate to org route for nav-settings', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-settings',
          label: 'Settings',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/settings',
        params: { organizationSlug: 'test-org' },
      });
    });

    it('should navigate to team route for nav-dashboard', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-dashboard',
          label: 'Dashboard',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to team route for nav-devices', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-devices',
          label: 'Devices',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/devices',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to team route for nav-commands', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-commands',
          label: 'Commands',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/commands',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to team route for nav-terminal', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-terminal',
          label: 'Terminal',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/terminal',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to team route for nav-terminal-bookmarks', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-terminal-bookmarks',
          label: 'Terminal Bookmarks',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/terminal/bookmarks',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should not navigate to team route when teamSlug is missing', () => {
      mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });

      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-dashboard',
          label: 'Dashboard',
        });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when navigation id does not match any route', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'navigation',
          id: 'nav-unknown' as never,
          label: 'Unknown',
        } as CommandPaletteResult);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleSelect - device type', () => {
    it('should navigate to terminal route for device with default action', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'device',
          id: 'device-1',
          label: 'My Device',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/terminal',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to terminal route for device with terminal action', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'device',
          id: 'device-1',
          label: 'My Device',
          action: 'terminal',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/terminal',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to commands route for device with command action', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'device',
          id: 'device-1',
          label: 'My Device',
          action: 'command',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/commands',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should navigate to devices route for device with settings action', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'device',
          id: 'device-1',
          label: 'My Device',
          action: 'settings',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/devices',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should not navigate for device when teamSlug is missing', () => {
      mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });

      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'device',
          id: 'device-1',
          label: 'My Device',
          action: 'terminal',
        });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleSelect - action type', () => {
    it('should navigate to commands with executeModal for action-new-command', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'action',
          id: 'action-new-command',
          label: 'New Command',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/commands',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
        search: { executeModal: 'open' },
      });
    });

    it('should navigate to terminal for action-new-session', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'action',
          id: 'action-new-session',
          label: 'New Session',
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/$organizationSlug/t/$teamSlug/terminal',
        params: { organizationSlug: 'test-org', teamSlug: 'default' },
      });
    });

    it('should not navigate for unknown action id', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'action',
          id: 'action-unknown' as never,
          label: 'Unknown',
        } as CommandPaletteResult);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate for action when teamSlug is missing', () => {
      mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });

      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'action',
          id: 'action-new-command',
          label: 'New Command',
        });
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleSelect - unknown type', () => {
    it('should not navigate for unknown item type', () => {
      const { result } = renderHook(() => useCommandPalette(), {
        wrapper: createQueryThemeWrapper(),
      });

      act(() => {
        result.current.handleSelect({
          type: 'unknown' as never,
          id: 'foo',
          label: 'Unknown',
        } as CommandPaletteResult);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

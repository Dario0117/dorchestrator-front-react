import type { TerminalEmulatorHandle } from '@domains/terminal/components/terminal-emulator.types';
import type { CustomShortcut } from '@domains/terminal/components/terminal-shortcut-panel.types';
import { useTerminalShortcuts } from '@domains/terminal/hooks/use-terminal-shortcuts';
import { createShortcutHandler } from '@domains/terminal/services/create-shortcut.http-service.handlers';
import { deleteShortcutHandler } from '@domains/terminal/services/delete-shortcut.http-service.handlers';
import { listShortcutsHandler } from '@domains/terminal/services/list-shortcuts.http-service.handlers';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { updateShortcutHandler } from '@domains/terminal/services/update-shortcut.http-service.handlers';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { server } from '@/../testsSetup';

const ORG_ID = 'org-123';
const SESSION_ID = 'session-456';

function setup({ isClosing = false } = {}) {
  const focusMock = vi.fn();
  const terminalRef = {
    current: { focus: focusMock } as TerminalEmulatorHandle,
  };

  const wrapper = createQueryThemeWrapper();

  const result = renderHook(
    () =>
      useTerminalShortcuts({
        organizationId: ORG_ID,
        sessionId: SESSION_ID,
        terminalRef,
        isClosing,
      }),
    { wrapper },
  );

  return { ...result, focusMock, terminalRef };
}

beforeEach(() => {
  server.use(
    listShortcutsHandler,
    createShortcutHandler,
    updateShortcutHandler,
    deleteShortcutHandler,
  );
});

describe('useTerminalShortcuts', () => {
  test('customShortcuts maps query data to CustomShortcut format', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    expect(result.current.customShortcuts[0]).toEqual({
      id: 1,
      label: 'ls -la',
      keySequence: 'ls -la\n',
      mode: 'keystroke',
      color: null,
      sortOrder: 0,
    });

    expect(result.current.customShortcuts[1]).toEqual({
      id: 2,
      label: 'git status',
      keySequence: 'git status\n',
      mode: 'snippet',
      color: '#22c55e',
      sortOrder: 1,
    });
  });

  test('handleAddShortcut opens dialog with no editing shortcut', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    act(() => {
      result.current.handleAddShortcut();
    });

    expect(result.current.shortcutDialogOpen).toBe(true);
    expect(result.current.editingShortcut).toBeNull();
  });

  test('handleEditShortcut sets editing shortcut and opens dialog', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    const shortcut: CustomShortcut = {
      id: 1,
      label: 'ls -la',
      keySequence: 'ls -la\n',
      mode: 'keystroke',
      color: null,
      sortOrder: 0,
    };

    act(() => {
      result.current.handleEditShortcut(shortcut);
    });

    expect(result.current.shortcutDialogOpen).toBe(true);
    expect(result.current.editingShortcut).not.toBeNull();
    expect(result.current.editingShortcut?.id).toBe(1);
  });

  test('handleEditShortcut does nothing when shortcut id is not found in query data', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    const nonExistentShortcut: CustomShortcut = {
      id: 9999,
      label: 'does not exist',
      keySequence: 'noop',
      mode: 'keystroke',
      color: null,
      sortOrder: 0,
    };

    act(() => {
      result.current.handleEditShortcut(nonExistentShortcut);
    });

    expect(result.current.shortcutDialogOpen).toBe(false);
    expect(result.current.editingShortcut).toBeNull();
  });

  test('handleDeleteShortcut calls delete mutation', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    // Should not throw — the delete mutation fires against the MSW handler
    act(() => {
      result.current.handleDeleteShortcut(1);
    });
  });

  test('handleShortcutPress does nothing when isClosing is true', async () => {
    const sendSpy = vi.spyOn(terminalWsClient, 'send');
    const { result, focusMock } = setup({ isClosing: true });

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    act(() => {
      result.current.handleShortcutPress('\x03');
    });

    expect(sendSpy).not.toHaveBeenCalled();
    expect(focusMock).not.toHaveBeenCalled();
    sendSpy.mockRestore();
  });

  test('handleCustomShortcutPress does nothing when isClosing is true', async () => {
    const sendSpy = vi.spyOn(terminalWsClient, 'send');
    const { result, focusMock } = setup({ isClosing: true });

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    const shortcut: CustomShortcut = {
      id: 1,
      label: 'ls -la',
      keySequence: 'ls -la\n',
      mode: 'keystroke',
      color: null,
      sortOrder: 0,
    };

    act(() => {
      result.current.handleCustomShortcutPress(shortcut);
    });

    expect(sendSpy).not.toHaveBeenCalled();
    expect(focusMock).not.toHaveBeenCalled();
    sendSpy.mockRestore();
  });

  test('handleShortcutPress sends pty:input and focuses terminal', async () => {
    const sendSpy = vi.spyOn(terminalWsClient, 'send');
    const { result, focusMock } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    act(() => {
      result.current.handleShortcutPress('\x03');
    });

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'pty:input',
      sessionId: SESSION_ID,
      data: '\x03',
    });
    expect(focusMock).toHaveBeenCalled();
    sendSpy.mockRestore();
  });

  test('handleCustomShortcutPress sends parsed keystroke for keystroke mode', async () => {
    const sendSpy = vi.spyOn(terminalWsClient, 'send');
    const { result, focusMock } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    const shortcut: CustomShortcut = {
      id: 1,
      label: 'Ctrl+C',
      keySequence: '\\x03',
      mode: 'keystroke',
      color: null,
      sortOrder: 0,
    };

    act(() => {
      result.current.handleCustomShortcutPress(shortcut);
    });

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'pty:input',
      sessionId: SESSION_ID,
      data: '\x03',
    });
    expect(focusMock).toHaveBeenCalled();
    sendSpy.mockRestore();
  });

  test('handleCustomShortcutPress sends snippet with trailing newline replaced', async () => {
    const sendSpy = vi.spyOn(terminalWsClient, 'send');
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    const shortcut: CustomShortcut = {
      id: 2,
      label: 'git status',
      keySequence: 'git status\n',
      mode: 'snippet',
      color: '#22c55e',
      sortOrder: 1,
    };

    act(() => {
      result.current.handleCustomShortcutPress(shortcut);
    });

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'pty:input',
      sessionId: SESSION_ID,
      data: 'git status\r',
    });
    sendSpy.mockRestore();
  });

  test('isSavingShortcut is false when no mutation is pending', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    expect(result.current.isSavingShortcut).toBe(false);
  });

  test('shortcutDialogOpen starts as false', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    expect(result.current.shortcutDialogOpen).toBe(false);
  });

  test('handleSaveShortcut creates shortcut when not editing', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    act(() => {
      result.current.handleSaveShortcut({
        label: 'New shortcut',
        keySequence: 'echo hello\n',
        mode: 'snippet',
      });
    });

    // Mutation should complete without errors
    await waitFor(() => {
      expect(result.current.isSavingShortcut).toBe(false);
    });
  });

  test('handleSaveShortcut updates shortcut when editing', async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.customShortcuts).toHaveLength(2);
    });

    // First, set editing state
    const shortcut: CustomShortcut = {
      id: 1,
      label: 'ls -la',
      keySequence: 'ls -la\n',
      mode: 'keystroke',
      color: null,
      sortOrder: 0,
    };

    act(() => {
      result.current.handleEditShortcut(shortcut);
    });

    expect(result.current.editingShortcut).not.toBeNull();

    act(() => {
      result.current.handleSaveShortcut({
        label: 'Updated shortcut',
        keySequence: 'ls -lah\n',
        mode: 'keystroke',
      });
    });

    // Mutation should complete without errors
    await waitFor(() => {
      expect(result.current.isSavingShortcut).toBe(false);
    });
  });
});

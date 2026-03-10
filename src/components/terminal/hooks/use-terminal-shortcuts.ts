import type { TerminalEmulatorHandle } from '@components/terminal/terminal-emulator.types';
import type { CustomShortcut } from '@components/terminal/terminal-shortcut-panel.types';
import { parseEscapeSequence } from '@lib/escape-sequence.utils';
import { useCreateShortcutMutation } from '@services/terminal/create-shortcut.http-service';
import { useDeleteShortcutMutation } from '@services/terminal/delete-shortcut.http-service';
import {
  type ShortcutItem,
  useShortcutsQueryOptions,
} from '@services/terminal/list-shortcuts.http-service';
import { terminalWsClient } from '@services/terminal/terminal-ws.client';
import { useUpdateShortcutMutation } from '@services/terminal/update-shortcut.http-service';
import { useQuery } from '@tanstack/react-query';
import type { RefObject } from 'react';
import { useCallback, useState } from 'react';

export function useTerminalShortcuts({
  organizationId,
  sessionId,
  terminalRef,
  isClosing,
}: {
  organizationId: string;
  sessionId: string;
  terminalRef: RefObject<TerminalEmulatorHandle | null>;
  isClosing: boolean;
}) {
  const shortcutsQuery = useQuery(useShortcutsQueryOptions(organizationId));
  const createShortcutMutation = useCreateShortcutMutation();
  const updateShortcutMutation = useUpdateShortcutMutation();
  const deleteShortcutMutation = useDeleteShortcutMutation();
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<ShortcutItem | null>(
    null,
  );

  const customShortcuts: CustomShortcut[] =
    shortcutsQuery.data?.responseData?.results.map((s) => ({
      id: s.id,
      label: s.label,
      keySequence: s.keySequence,
      mode: s.mode,
      color: s.color,
      sortOrder: s.sortOrder,
    })) ?? [];

  const handleAddShortcut = useCallback(() => {
    setEditingShortcut(null);
    setShortcutDialogOpen(true);
  }, []);

  const handleEditShortcut = useCallback(
    (shortcut: CustomShortcut) => {
      const fullShortcut = shortcutsQuery.data?.responseData?.results.find(
        (s) => s.id === shortcut.id,
      );
      if (fullShortcut) {
        setEditingShortcut(fullShortcut);
        setShortcutDialogOpen(true);
      }
    },
    [shortcutsQuery.data],
  );

  const handleDeleteShortcut = useCallback(
    (shortcutId: number) => {
      deleteShortcutMutation.mutate({
        params: {
          path: { organizationId, shortcutId },
        },
      });
    },
    [organizationId, deleteShortcutMutation],
  );

  const handleCustomShortcutPress = useCallback(
    (shortcut: CustomShortcut) => {
      if (isClosing) {
        return;
      }

      const data =
        shortcut.mode === 'keystroke'
          ? parseEscapeSequence(shortcut.keySequence)
          : shortcut.keySequence.replace(/\n$/, '\r');

      terminalWsClient.send({
        type: 'pty:input',
        sessionId,
        data,
      });
      terminalRef.current?.focus();
    },
    [isClosing, sessionId, terminalRef],
  );

  const handleShortcutPress = useCallback(
    (sequence: string) => {
      if (isClosing) {
        return;
      }
      terminalWsClient.send({
        type: 'pty:input',
        sessionId,
        data: sequence,
      });
      terminalRef.current?.focus();
    },
    [sessionId, isClosing, terminalRef],
  );

  const handleSaveShortcut = useCallback(
    (data: {
      label: string;
      keySequence: string;
      mode: 'keystroke' | 'snippet';
      color?: string | null;
      icon?: string | null;
      sortOrder?: number;
    }) => {
      if (editingShortcut) {
        updateShortcutMutation.mutate(
          {
            params: {
              path: {
                organizationId,
                shortcutId: editingShortcut.id,
              },
            },
            body: {
              label: data.label,
              keySequence: data.keySequence,
              mode: data.mode,
              color: data.color,
              icon: data.icon,
              sortOrder: data.sortOrder,
            },
          },
          {
            onSuccess: () => {
              setShortcutDialogOpen(false);
              setEditingShortcut(null);
            },
          },
        );
      } else {
        createShortcutMutation.mutate(
          {
            params: {
              path: { organizationId },
            },
            body: {
              label: data.label,
              keySequence: data.keySequence,
              mode: data.mode,
              color: data.color,
              icon: data.icon,
              sortOrder: data.sortOrder ?? 0,
            },
          },
          {
            onSuccess: () => {
              setShortcutDialogOpen(false);
            },
          },
        );
      }
    },
    [
      editingShortcut,
      organizationId,
      createShortcutMutation,
      updateShortcutMutation,
    ],
  );

  return {
    customShortcuts,
    shortcutDialogOpen,
    setShortcutDialogOpen,
    editingShortcut,
    isSavingShortcut:
      createShortcutMutation.isPending || updateShortcutMutation.isPending,
    handleAddShortcut,
    handleEditShortcut,
    handleDeleteShortcut,
    handleCustomShortcutPress,
    handleShortcutPress,
    handleSaveShortcut,
  };
}

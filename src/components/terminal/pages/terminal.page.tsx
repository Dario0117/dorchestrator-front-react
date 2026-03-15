import { useFontSize } from '@components/terminal/hooks/use-font-size';
import { useTerminalBookmark } from '@components/terminal/hooks/use-terminal-bookmark';
import { useTerminalSessionLifecycle } from '@components/terminal/hooks/use-terminal-session-lifecycle';
import { useTerminalShare } from '@components/terminal/hooks/use-terminal-share';
import { useTerminalShortcuts } from '@components/terminal/hooks/use-terminal-shortcuts';
import { SessionImagePanel } from '@components/terminal/session-image-panel';
import { ShortcutBuilderDialog } from '@components/terminal/shortcut-builder-dialog';
import { SuggestionNotificationPanel } from '@components/terminal/suggestion-notification-panel';
import { TerminalEmulator } from '@components/terminal/terminal-emulator';
import type { TerminalEmulatorHandle } from '@components/terminal/terminal-emulator.types';
import { TerminalReauthModal } from '@components/terminal/terminal-reauth-modal';
import { TerminalShortcutPanel } from '@components/terminal/terminal-shortcut-panel';
import { TerminalToolbar } from '@components/terminal/terminal-toolbar';
import { useParams } from '@tanstack/react-router';
import { useRef } from 'react';

export function TerminalPage({
  organizationId,
  sessionId: sessionIdNum,
  isShared: initialIsShared,
  shareToken: initialShareToken,
  onSessionLocked,
  onSessionTerminated,
}: {
  organizationId: string;
  sessionId: number;
  isShared: boolean;
  shareToken: string | null;
  onSessionLocked?: () => void;
  onSessionTerminated?: () => void;
}) {
  const { sessionId, organizationSlug, teamSlug } = useParams({
    strict: false,
  }) as { sessionId: string; organizationSlug: string; teamSlug: string };
  const terminalRef = useRef<TerminalEmulatorHandle>(null);

  const fontSizeControls = useFontSize();

  const lifecycle = useTerminalSessionLifecycle({
    organizationId,
    organizationSlug,
    teamSlug,
    sessionId,
  });

  const share = useTerminalShare({
    organizationId,
    organizationSlug,
    sessionId: sessionIdNum,
    initialIsShared,
    initialShareToken,
  });

  const bookmark = useTerminalBookmark({
    organizationId,
    sessionId: sessionIdNum,
  });

  const shortcuts = useTerminalShortcuts({
    organizationId,
    sessionId,
    terminalRef,
    isClosing: lifecycle.isClosing,
  });

  return (
    <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)]">
      <TerminalToolbar
        sessionId={sessionId}
        fontSizeControls={fontSizeControls}
        share={share}
        bookmark={bookmark}
        isClosing={lifecycle.isClosing}
        warningMessage={lifecycle.warningMessage}
        onExtendClick={() => lifecycle.setShowExtendReauth(true)}
        onCloseSession={lifecycle.handleCloseSession}
      />
      <div className="shrink-0 border-b">
        <TerminalShortcutPanel
          onShortcutPress={shortcuts.handleShortcutPress}
          onCustomShortcutPress={shortcuts.handleCustomShortcutPress}
          customShortcuts={shortcuts.customShortcuts}
          onAddShortcut={shortcuts.handleAddShortcut}
          onEditShortcut={shortcuts.handleEditShortcut}
          onDeleteShortcut={shortcuts.handleDeleteShortcut}
        />
      </div>
      <ShortcutBuilderDialog
        open={shortcuts.shortcutDialogOpen}
        onOpenChange={shortcuts.setShortcutDialogOpen}
        onSave={shortcuts.handleSaveShortcut}
        isSaving={shortcuts.isSavingShortcut}
        editingShortcut={shortcuts.editingShortcut}
      />
      <div className="shrink-0 border-b">
        <SessionImagePanel
          organizationId={organizationId}
          sessionId={sessionIdNum}
        />
      </div>
      <SuggestionNotificationPanel
        sessionId={sessionId}
        organizationId={organizationId}
      />
      {lifecycle.warningMessage && (
        <div className="shrink-0 border-b bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {lifecycle.warningMessage}
          {lifecycle.isExtendError && (
            <span className="ml-2 font-medium">
              Failed to extend session. Please try again.
            </span>
          )}
        </div>
      )}
      <TerminalReauthModal
        open={lifecycle.showExtendReauth}
        onOpenChange={lifecycle.setShowExtendReauth}
        organizationId={organizationId}
        onSuccess={lifecycle.handleExtendSuccess}
      />
      <div className="relative min-h-0 flex-1">
        <TerminalEmulator
          ref={terminalRef}
          sessionId={sessionId}
          fontSize={fontSizeControls.fontSize}
          onSessionEnd={lifecycle.handleSessionEnd}
          onSessionLocked={onSessionLocked}
          onSessionWarning={lifecycle.handleSessionWarning}
          onSessionTerminated={onSessionTerminated}
        />
        {lifecycle.isClosing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <p className="text-sm text-muted-foreground">
              Closing session&hellip;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

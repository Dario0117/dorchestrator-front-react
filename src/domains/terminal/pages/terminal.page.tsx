import { AlertBanner } from '@components/ds/atoms/alert-banner';
import { Center } from '@components/ds/atoms/center';
import { FlexFill } from '@components/ds/atoms/flex-fill';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { SessionFilePanel } from '@domains/terminal/components/session-file-panel';
import { SuggestionNotificationPanel } from '@domains/terminal/components/suggestion-notification-panel';
import { TerminalConnectionOverlay } from '@domains/terminal/components/terminal-connection-overlay';
import { TerminalEmulator } from '@domains/terminal/components/terminal-emulator';
import type { TerminalEmulatorHandle } from '@domains/terminal/components/terminal-emulator.types';
import { TerminalShortcutPanel } from '@domains/terminal/components/terminal-shortcut-panel';
import { TerminalToolbar } from '@domains/terminal/components/terminal-toolbar';
import { useFontSize } from '@domains/terminal/hooks/use-font-size';
import { useTerminalBookmark } from '@domains/terminal/hooks/use-terminal-bookmark';
import { useTerminalSessionLifecycle } from '@domains/terminal/hooks/use-terminal-session-lifecycle';
import { useTerminalShare } from '@domains/terminal/hooks/use-terminal-share';
import { useTerminalShortcuts } from '@domains/terminal/hooks/use-terminal-shortcuts';
import { ShortcutBuilderDialog } from '@domains/terminal/modals/shortcut-builder-dialog';
import { TerminalReauthModal } from '@domains/terminal/modals/terminal-reauth-modal';
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
    <Stack
      fullHeight
      safeAreaBottom
    >
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
      <TerminalShortcutPanel
        onShortcutPress={shortcuts.handleShortcutPress}
        onCustomShortcutPress={shortcuts.handleCustomShortcutPress}
        customShortcuts={shortcuts.customShortcuts}
        onAddShortcut={shortcuts.handleAddShortcut}
        onEditShortcut={shortcuts.handleEditShortcut}
        onDeleteShortcut={shortcuts.handleDeleteShortcut}
      />
      <ShortcutBuilderDialog
        open={shortcuts.shortcutDialogOpen}
        onOpenChange={shortcuts.setShortcutDialogOpen}
        onSave={shortcuts.handleSaveShortcut}
        isSaving={shortcuts.isSavingShortcut}
        editingShortcut={shortcuts.editingShortcut}
      />
      <SessionFilePanel
        organizationId={organizationId}
        sessionId={sessionIdNum}
      />
      <SuggestionNotificationPanel
        sessionId={sessionId}
        organizationId={organizationId}
      />
      {lifecycle.warningMessage && (
        <AlertBanner inline>
          <SmallText color="destructive">{lifecycle.warningMessage}</SmallText>
          {lifecycle.isExtendError && (
            <SmallText
              weight="medium"
              color="destructive"
              spaceLeft="sm"
            >
              Failed to extend session. Please try again.
            </SmallText>
          )}
        </AlertBanner>
      )}
      <TerminalReauthModal
        open={lifecycle.showExtendReauth}
        onOpenChange={lifecycle.setShowExtendReauth}
        organizationId={organizationId}
        onSuccess={lifecycle.handleExtendSuccess}
      />
      <FlexFill>
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
          <Center
            fullHeight
            fullWidth
            bg="muted/50"
          >
            <SecondaryParagraph>Closing session&hellip;</SecondaryParagraph>
          </Center>
        )}
        {!lifecycle.isClosing && <TerminalConnectionOverlay />}
      </FlexFill>
    </Stack>
  );
}

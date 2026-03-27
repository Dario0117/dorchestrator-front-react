import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { Surface } from '@components/ds/atoms/surface';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ds/atoms/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ds/molecules/alert-dialog';
import { FontSizeControls } from '@domains/terminal/components/font-size-controls';
import { SessionViewerList } from '@domains/terminal/components/session-viewer-list';
import type { useFontSize } from '@domains/terminal/hooks/use-font-size';
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Link,
  Link2Off,
  RefreshCw,
  X,
} from 'lucide-react';
import { useCallback, useRef } from 'react';

interface TerminalToolbarProps {
  sessionId: string;
  fontSizeControls: ReturnType<typeof useFontSize>;
  share: {
    isShared: boolean;
    shareUrl: string | null;
    hasCopied: boolean;
    isSharePending: boolean;
    handleToggleShare: () => void;
    copyShareUrl: () => void;
  };
  bookmark: {
    bookmarkId: number | null;
    isBookmarkPending: boolean;
    handleToggleBookmark: () => void;
  };
  isClosing: boolean;
  warningMessage: string | null;
  onExtendClick: () => void;
  onCloseSession: () => void;
}

export function TerminalToolbar({
  sessionId,
  fontSizeControls,
  share,
  bookmark,
  isClosing,
  warningMessage,
  onExtendClick,
  onCloseSession,
}: TerminalToolbarProps) {
  const controlsDisabled = isClosing;
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleToolbarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const toolbar = toolbarRef.current;
      /* v8 ignore start -- defensive guard: ref is always attached */
      if (!toolbar) {
        return;
      }
      /* v8 ignore stop */

      const focusableElements = Array.from(
        toolbar.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [tabindex]:not([tabindex="-1"]):not(:disabled)',
        ),
      );

      /* v8 ignore start -- defensive guard: toolbar always has focusable elements */
      if (focusableElements.length === 0) {
        return;
      }
      /* v8 ignore stop */

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      );

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex =
            currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowLeft':
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = focusableElements.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      focusableElements[nextIndex]?.focus();
    },
    [],
  );

  return (
    <TooltipProvider delay={300}>
      <HStack
        justify="between"
        shrink={false}
        border="bottom"
        ref={toolbarRef}
        role="toolbar"
        aria-label="Terminal session controls"
        onKeyDown={handleToolbarKeyDown}
      >
        {/* Left section: font size controls + session viewers */}
        <HStack innerSpaceX="md">
          <FontSizeControls
            fontSize={fontSizeControls.fontSize}
            onIncrease={fontSizeControls.increase}
            onDecrease={fontSizeControls.decrease}
          />
          {share.isShared && (
            <Surface
              border="left"
              innerSpaceLeft="xs"
            >
              <SessionViewerList sessionId={sessionId} />
            </Surface>
          )}
        </HStack>

        {/* Right section: actions */}
        <HStack
          gap="xs"
          innerSpaceX="xs"
        >
          {share.isShared && share.shareUrl && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={share.copyShareUrl}
                    disabled={controlsDisabled}
                    aria-label={
                      share.hasCopied ? 'Link copied' : 'Copy share link'
                    }
                    tabIndex={-1}
                  />
                }
              >
                {share.hasCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {share.hasCopied ? 'Link copied' : 'Copy share link'}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={share.handleToggleShare}
                  disabled={controlsDisabled || share.isSharePending}
                  aria-label={share.isShared ? 'Stop sharing' : 'Share session'}
                  tabIndex={-1}
                />
              }
            >
              {share.isShared ? (
                <Link2Off className="h-4 w-4" />
              ) : share.hasCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Link className="h-4 w-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {share.isShared ? 'Stop sharing' : 'Share session'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={bookmark.handleToggleBookmark}
                  disabled={controlsDisabled || bookmark.isBookmarkPending}
                  aria-label={
                    bookmark.bookmarkId !== null
                      ? 'Remove bookmark'
                      : 'Bookmark session'
                  }
                  tabIndex={-1}
                />
              }
            >
              {bookmark.bookmarkId !== null ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {bookmark.bookmarkId !== null
                ? 'Remove bookmark'
                : 'Bookmark session'}
            </TooltipContent>
          </Tooltip>

          {warningMessage && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onExtendClick}
                    disabled={controlsDisabled}
                    aria-label="Extend session"
                    tabIndex={-1}
                  />
                }
              >
                <RefreshCw className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Extend session</TooltipContent>
            </Tooltip>
          )}

          <Surface
            border="left"
            innerSpaceLeft="xs"
          >
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isClosing}
                    tabIndex={-1}
                  />
                }
              >
                <X className="mr-1 h-4 w-4" />
                End Session
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End terminal session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will terminate the terminal session and kill the
                    underlying process. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onCloseSession}>
                    End Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Surface>
        </HStack>
      </HStack>
    </TooltipProvider>
  );
}

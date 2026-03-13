import { FontSizeControls } from '@components/terminal/font-size-controls';
import type { useFontSize } from '@components/terminal/hooks/use-font-size';
import { SessionViewerList } from '@components/terminal/session-viewer-list';
import { TerminalConnectionStatus } from '@components/terminal/terminal-connection-status';
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
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Link,
  Link2Off,
  RefreshCw,
  X,
} from 'lucide-react';

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
  return (
    <div className="flex shrink-0 items-center justify-between border-b">
      <TerminalConnectionStatus />
      <div className="flex items-center gap-1 px-2">
        <FontSizeControls
          fontSize={fontSizeControls.fontSize}
          onIncrease={fontSizeControls.increase}
          onDecrease={fontSizeControls.decrease}
        />
        {share.isShared && <SessionViewerList sessionId={sessionId} />}
        {share.isShared && share.shareUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={share.copyShareUrl}
            disabled={isClosing}
          >
            {share.hasCopied ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Link className="mr-1 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={share.handleToggleShare}
          disabled={isClosing || share.isSharePending}
        >
          {share.isShared ? (
            <>
              <Link2Off className="mr-1 h-4 w-4" />
              Stop Sharing
            </>
          ) : share.hasCopied ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Link Copied
            </>
          ) : (
            <>
              <Link className="mr-1 h-4 w-4" />
              Share Session
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={bookmark.handleToggleBookmark}
          disabled={isClosing || bookmark.isBookmarkPending}
        >
          {bookmark.bookmarkId !== null ? (
            <>
              <BookmarkCheck className="mr-1 h-4 w-4" />
              Bookmarked
            </>
          ) : (
            <>
              <Bookmark className="mr-1 h-4 w-4" />
              Bookmark
            </>
          )}
        </Button>
        {warningMessage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExtendClick}
            disabled={isClosing}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Extend Session
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isClosing}
            >
              <X className="mr-1 h-4 w-4" />
              Close Session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close terminal session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will terminate the terminal session and kill the underlying
                process. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onCloseSession}>
                Close Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

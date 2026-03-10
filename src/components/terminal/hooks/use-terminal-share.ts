import { useCopyToClipboard } from '@hooks/use-copy-to-clipboard';
import { useShareTerminalSessionMutation } from '@services/terminal/share-terminal-session.http-service';
import { useUnshareTerminalSessionMutation } from '@services/terminal/unshare-terminal-session.http-service';
import { useCallback, useState } from 'react';

export function useTerminalShare({
  organizationId,
  organizationSlug,
  sessionId,
  initialIsShared,
  initialShareToken,
}: {
  organizationId: string;
  organizationSlug: string;
  sessionId: number;
  initialIsShared: boolean;
  initialShareToken: string | null;
}) {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [shareUrl, setShareUrl] = useState<string | null>(() => {
    if (initialShareToken && organizationSlug) {
      return `${window.location.origin}/${organizationSlug}/terminal/shared/${initialShareToken}`;
    }
    return null;
  });
  const shareMutation = useShareTerminalSessionMutation();
  const unshareMutation = useUnshareTerminalSessionMutation();
  const { copy, hasCopied } = useCopyToClipboard();

  const handleToggleShare = useCallback(() => {
    if (isShared) {
      unshareMutation.mutate(
        {
          params: {
            path: { organizationId, sessionId },
          },
        },
        {
          onSuccess: () => {
            setIsShared(false);
            setShareUrl(null);
          },
        },
      );
    } else {
      shareMutation.mutate(
        {
          params: {
            path: { organizationId, sessionId },
          },
        },
        {
          onSuccess: (data) => {
            setIsShared(true);
            const shareToken = data.responseData?.results.shareToken;
            if (shareToken) {
              const url = `${window.location.origin}/${organizationSlug}/terminal/shared/${shareToken}`;
              setShareUrl(url);
              copy(url, 'share');
            }
          },
        },
      );
    }
  }, [
    isShared,
    organizationId,
    organizationSlug,
    sessionId,
    shareMutation,
    unshareMutation,
    copy,
  ]);

  const copyShareUrl = useCallback(() => {
    if (shareUrl) {
      copy(shareUrl, 'share');
    }
  }, [shareUrl, copy]);

  return {
    isShared,
    shareUrl,
    hasCopied,
    isSharePending: shareMutation.isPending || unshareMutation.isPending,
    handleToggleShare,
    copyShareUrl,
  };
}

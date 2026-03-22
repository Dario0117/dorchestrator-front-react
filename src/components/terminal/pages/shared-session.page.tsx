import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { FontSizeControls } from '@components/terminal/font-size-controls';
import { useFontSize } from '@components/terminal/hooks/use-font-size';
import { SuggestionSidebar } from '@components/terminal/suggestion-sidebar';
import { TerminalConnectionStatus } from '@components/terminal/terminal-connection-status';
import { TerminalEmulator } from '@components/terminal/terminal-emulator';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { badgeStyles } from '@lib/badge-styles';
import { useResolveShareLinkQuery } from '@services/terminal/resolve-share-link.http-service';
import { terminalWsClient } from '@services/terminal/terminal-ws.client';
import { Link, useParams } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Eye, Terminal } from 'lucide-react';
import { useEffect } from 'react';

export function SharedSessionPage({
  shareToken,
  organizationSlug,
  organizationId,
}: {
  shareToken: string;
  organizationSlug: string;
  organizationId: string;
}) {
  const { teamSlug } = useParams({ strict: false }) as { teamSlug: string };
  const {
    fontSize,
    increase: increaseFontSize,
    decrease: decreaseFontSize,
  } = useFontSize();

  const { data, isLoading, isError, error } = useResolveShareLinkQuery(
    organizationId,
    shareToken,
  );

  const resolvedSessionId = data?.responseData?.results
    ? String(data.responseData.results.sessionId)
    : null;

  useEffect(() => {
    return () => {
      if (resolvedSessionId) {
        terminalWsClient.send({
          type: 'viewer:leave',
          sessionId: resolvedSessionId,
        });
      }
    };
  }, [resolvedSessionId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
      </div>
    );
  }

  // 410 Gone — session terminated
  const statusCode = (error as { status?: number } | null)?.status;
  if (statusCode === 410) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Terminal className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Session ended</h2>
          <SecondaryParagraph>
            This shared terminal session has been terminated.
          </SecondaryParagraph>
          <Button
            variant="outline"
            render={
              <Link
                to="/$organizationSlug/t/$teamSlug/terminal"
                params={{ organizationSlug, teamSlug }}
              />
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sessions
          </Button>
        </div>
      </div>
    );
  }

  if (isError || !data?.responseData) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Session not available</h2>
          <SecondaryParagraph>
            This share link is invalid, expired, or you don&apos;t have access.
          </SecondaryParagraph>
          <Button
            variant="outline"
            render={
              <Link
                to="/$organizationSlug/t/$teamSlug/terminal"
                params={{ organizationSlug, teamSlug }}
              />
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sessions
          </Button>
        </div>
      </div>
    );
  }

  const session = data.responseData.results;

  return (
    <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)]">
      <div className="flex shrink-0 items-center justify-between border-b">
        <TerminalConnectionStatus />
        <div className="flex items-center gap-1 px-2">
          <FontSizeControls
            fontSize={fontSize}
            onIncrease={increaseFontSize}
            onDecrease={decreaseFontSize}
          />
          <Badge
            variant="outline"
            className={badgeStyles.blue}
          >
            <Eye className="mr-1 h-3 w-3" />
            Viewing
          </Badge>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 flex">
        <div className="min-w-0 flex-1">
          <TerminalEmulator
            sessionId={String(session.sessionId)}
            fontSize={fontSize}
            readOnly
            shareToken={shareToken}
          />
        </div>
        <div className="w-64 shrink-0">
          <SuggestionSidebar
            sessionId={String(session.sessionId)}
            organizationId={session.organizationId}
          />
        </div>
      </div>
    </div>
  );
}

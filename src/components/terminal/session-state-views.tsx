import { TerminalReauthModal } from '@components/terminal/terminal-reauth-modal';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { badgeStyles } from '@lib/badge-styles';
import type { TerminalSessionDetail } from '@services/terminal/get-terminal-session.http-service';
import { useUnlockTerminalSessionMutation } from '@services/terminal/unlock-terminal-session.http-service';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Lock, Play, Terminal } from 'lucide-react';
import { useState } from 'react';

export function SessionLoadingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
    </div>
  );
}

export function SessionNotFound({
  organizationSlug,
}: {
  organizationSlug: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Session not found</h2>
        <p className="text-sm text-muted-foreground">
          This session does not exist or you don&apos;t have access to it.
        </p>
        <Button
          variant="outline"
          asChild
        >
          <Link
            to="/$organizationSlug/terminal"
            params={{ organizationSlug }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sessions
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function SessionTerminated({
  session,
  organizationSlug,
}: {
  session: TerminalSessionDetail;
  organizationSlug: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Terminal className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Session terminated</h2>
        <p className="text-sm text-muted-foreground">
          This terminal session has been terminated and cannot be reconnected.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{session.deviceName}</span>
          <span>&middot;</span>
          <span>{session.shell}</span>
          <span>&middot;</span>
          <Badge
            variant="outline"
            className={badgeStyles.gray}
          >
            terminated
          </Badge>
        </div>
        {session.terminatedAt && (
          <p className="text-xs text-muted-foreground">
            Terminated at {new Date(session.terminatedAt).toLocaleString()}
          </p>
        )}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link
              to="/$organizationSlug/terminal/sessions/$sessionId/recording"
              params={{
                organizationSlug,
                sessionId: String(session.id),
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              View Recording
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <Link
              to="/$organizationSlug/terminal"
              params={{ organizationSlug }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sessions
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SessionLocked({
  session,
  organizationId,
  organizationSlug,
  onUnlocked,
}: {
  session: TerminalSessionDetail;
  organizationId: string;
  organizationSlug: string;
  onUnlocked: () => void;
}) {
  const [showReauth, setShowReauth] = useState(true);
  const unlockMutation = useUnlockTerminalSessionMutation();

  const handleReauthSuccess = (token: string) => {
    unlockMutation.mutate(
      {
        params: {
          path: { organizationId, sessionId: session.id },
        },
        body: { reauthToken: token },
      },
      {
        onSuccess: () => {
          setShowReauth(false);
          onUnlocked();
        },
      },
    );
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Session locked</h2>
        <p className="text-sm text-muted-foreground">
          This session has been locked due to inactivity. Re-authenticate to
          resume.
        </p>
        {unlockMutation.isError && (
          <p className="text-sm text-destructive">
            Failed to unlock session. Please try again.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{session.deviceName}</span>
          <span>&middot;</span>
          <span>{session.shell}</span>
          <span>&middot;</span>
          <Badge
            variant="outline"
            className={badgeStyles.yellow}
          >
            locked
          </Badge>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => setShowReauth(true)}>Re-authenticate</Button>
          <Button
            variant="outline"
            asChild
          >
            <Link
              to="/$organizationSlug/terminal"
              params={{ organizationSlug }}
            >
              Back to sessions
            </Link>
          </Button>
        </div>
      </div>
      <TerminalReauthModal
        open={showReauth}
        onOpenChange={setShowReauth}
        organizationId={organizationId}
        onSuccess={handleReauthSuccess}
      />
    </div>
  );
}

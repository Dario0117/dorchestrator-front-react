import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { TerminalReauthModal } from '@components/terminal/terminal-reauth-modal';
import { badgeStyles } from '@lib/badge-styles';
import type { TerminalSessionDetail } from '@services/terminal/get-terminal-session.http-service';
import { useUnlockTerminalSessionMutation } from '@services/terminal/unlock-terminal-session.http-service';
import { Link } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
import { useState } from 'react';

export function SessionLocked({
  session,
  organizationId,
  organizationSlug,
  teamSlug,
  onUnlocked,
}: {
  session: TerminalSessionDetail;
  organizationId: string;
  organizationSlug: string;
  teamSlug: string;
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
        <SecondaryParagraph>
          This session has been locked due to inactivity. Re-authenticate to
          resume.
        </SecondaryParagraph>
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
            render={
              <Link
                to="/$organizationSlug/t/$teamSlug/terminal"
                params={{ organizationSlug, teamSlug }}
              />
            }
          >
            Back to sessions
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

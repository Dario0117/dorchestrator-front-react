import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { badgeStyles } from '@lib/badge-styles';
import type { TerminalSessionDetail } from '@services/terminal/get-terminal-session.http-service';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Play, Terminal } from 'lucide-react';

export function SessionTerminated({
  session,
  organizationSlug,
  teamSlug,
}: {
  session: TerminalSessionDetail;
  organizationSlug: string;
  teamSlug: string;
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
            render={
              <Link
                to="/$organizationSlug/t/$teamSlug/terminal/sessions/$sessionId/recording"
                params={{
                  organizationSlug,
                  teamSlug,
                  sessionId: String(session.id),
                }}
              />
            }
          >
            <Play className="mr-2 h-4 w-4" />
            View Recording
          </Button>
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
    </div>
  );
}

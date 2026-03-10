import { TerminalPage } from '@components/terminal/pages/terminal.page';
import {
  SessionLocked,
  SessionTerminated,
} from '@components/terminal/session-state-views';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useTerminalSessionSuspenseQuery } from '@services/terminal/get-terminal-session.http-service';
import { useParams } from '@tanstack/react-router';

export function TerminalSessionPage() {
  const { sessionId, organizationSlug } = useParams({
    from: '/(authenticated)/$organizationSlug/terminal/$sessionId',
  });
  const currentOrganization = useCurrentOrganization();
  const organizationId = currentOrganization.id;

  const { data, refetch } = useTerminalSessionSuspenseQuery(
    organizationId,
    Number(sessionId),
  );

  const session = data.responseData.results;

  if (session.status === 'terminated') {
    return (
      <SessionTerminated
        session={session}
        organizationSlug={organizationSlug}
      />
    );
  }

  if (session.status === 'locked') {
    return (
      <SessionLocked
        session={session}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        onUnlocked={() => refetch()}
      />
    );
  }

  // active or created — show terminal
  return (
    <TerminalPage
      organizationId={organizationId}
      sessionId={session.id}
      isShared={session.isShared}
      shareToken={session.shareToken ?? null}
      onSessionLocked={() => refetch()}
      onSessionTerminated={() => refetch()}
    />
  );
}

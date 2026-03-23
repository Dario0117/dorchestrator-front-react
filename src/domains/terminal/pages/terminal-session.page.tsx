import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { SessionLocked } from '@domains/terminal/components/session-locked';
import { SessionTerminated } from '@domains/terminal/components/session-terminated';
import { TerminalPage } from '@domains/terminal/pages/terminal.page';
import { useTerminalSessionSuspenseQuery } from '@domains/terminal/services/get-terminal-session.http-service';
import { useParams } from '@tanstack/react-router';

export function TerminalSessionPage() {
  const { sessionId, organizationSlug, teamSlug } = useParams({
    from: '/(authenticated)/$organizationSlug/t/$teamSlug/terminal/$sessionId',
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
        teamSlug={teamSlug}
      />
    );
  }

  if (session.status === 'locked') {
    return (
      <SessionLocked
        session={session}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        teamSlug={teamSlug}
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

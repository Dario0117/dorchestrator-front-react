import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { HStack } from '@components/ds/atoms/hstack';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { IconCircle } from '@domains/shared/components/icon-circle';
import { TerminalReauthModal } from '@domains/terminal/modals/terminal-reauth-modal';
import type { TerminalSessionDetail } from '@domains/terminal/services/get-terminal-session.http-service';
import { useUnlockTerminalSessionMutation } from '@domains/terminal/services/unlock-terminal-session.http-service';
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
    <Center
      fullHeight
      padding="md"
    >
      <Stack
        gap="lg"
        textAlign="center"
      >
        <IconCircle>
          <Lock className="h-6 w-6 text-muted-foreground" />
        </IconCircle>
        <SectionTitle size="xl">Session locked</SectionTitle>
        <SecondaryParagraph>
          This session has been locked due to inactivity. Re-authenticate to
          resume.
        </SecondaryParagraph>
        {unlockMutation.isError && (
          <SecondaryParagraph color="destructive">
            Failed to unlock session. Please try again.
          </SecondaryParagraph>
        )}
        <Center textSize="sm">
          <SmallText color="muted">{session.deviceName}</SmallText>
          <SmallText color="muted">&middot;</SmallText>
          <SmallText color="muted">{session.shell}</SmallText>
          <SmallText color="muted">&middot;</SmallText>
          <Badge
            variant="outline"
            colorScheme="warning"
          >
            locked
          </Badge>
        </Center>
        <HStack
          gap="sm"
          justify="center"
        >
          <Button onClick={() => setShowReauth(true)}>Re-authenticate</Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                to="/$organizationSlug/t/$teamSlug/terminal"
                params={{ organizationSlug, teamSlug }}
              />
            }
          >
            Back to sessions
          </Button>
        </HStack>
      </Stack>
      <TerminalReauthModal
        open={showReauth}
        onOpenChange={setShowReauth}
        organizationId={organizationId}
        onSuccess={handleReauthSuccess}
      />
    </Center>
  );
}

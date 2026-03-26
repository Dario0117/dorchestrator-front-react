import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { HStack } from '@components/ds/atoms/hstack';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { IconCircle } from '@domains/shared/components/icon-circle';
import type { TerminalSessionDetail } from '@domains/terminal/services/get-terminal-session.http-service';
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
    <Center
      fullHeight
      padding="md"
    >
      <Stack
        gap="lg"
        textAlign="center"
      >
        <IconCircle>
          <Terminal className="h-6 w-6 text-muted-foreground" />
        </IconCircle>
        <SectionTitle size="xl">Session terminated</SectionTitle>
        <SecondaryParagraph>
          This terminal session has been terminated and cannot be reconnected.
        </SecondaryParagraph>
        <Center textSize="sm">
          <SmallText color="muted">{session.deviceName}</SmallText>
          <SmallText color="muted">&middot;</SmallText>
          <SmallText color="muted">{session.shell}</SmallText>
          <SmallText color="muted">&middot;</SmallText>
          <Badge
            variant="outline"
            colorScheme="neutral"
          >
            terminated
          </Badge>
        </Center>
        {session.terminatedAt && (
          <SmallParagraph>
            Terminated at {new Date(session.terminatedAt).toLocaleString()}
          </SmallParagraph>
        )}
        <HStack
          gap="sm"
          justify="center"
        >
          <Button
            variant="outline"
            nativeButton={false}
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
            nativeButton={false}
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
        </HStack>
      </Stack>
    </Center>
  );
}

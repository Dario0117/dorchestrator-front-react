import { Badge } from '@components/ds/atoms/badge';
import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { Flex } from '@components/ds/atoms/flex';
import { HStack } from '@components/ds/atoms/hstack';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { Skeleton } from '@components/ds/atoms/skeleton';
import { Stack } from '@components/ds/atoms/stack';
import { IconCircle } from '@domains/shared/components/icon-circle';
import { FontSizeControls } from '@domains/terminal/components/font-size-controls';
import { SuggestionSidebar } from '@domains/terminal/components/suggestion-sidebar';
import { TerminalConnectionStatus } from '@domains/terminal/components/terminal-connection-status';
import { TerminalEmulator } from '@domains/terminal/components/terminal-emulator';
import { useFontSize } from '@domains/terminal/hooks/use-font-size';
import { useResolveShareLinkQuery } from '@domains/terminal/services/resolve-share-link.http-service';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
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
      <Center fullHeight>
        <Stack
          gap="lg"
          textAlign="center"
        >
          <Skeleton
            centered
            h="2rem"
            w="12rem"
          />
          <Skeleton
            centered
            h="1rem"
            w="16rem"
          />
        </Stack>
      </Center>
    );
  }

  // 410 Gone — session terminated
  const statusCode = (error as { status?: number } | null)?.status;
  if (statusCode === 410) {
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
          <SectionTitle size="xl">Session ended</SectionTitle>
          <SecondaryParagraph>
            This shared terminal session has been terminated.
          </SecondaryParagraph>
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
        </Stack>
      </Center>
    );
  }

  if (isError || !data?.responseData) {
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
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </IconCircle>
          <SectionTitle size="xl">Session not available</SectionTitle>
          <SecondaryParagraph>
            This share link is invalid, expired, or you don&apos;t have access.
          </SecondaryParagraph>
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
        </Stack>
      </Center>
    );
  }

  const session = data.responseData.results;

  return (
    <Stack
      fullHeight
      safeAreaBottom
    >
      <HStack
        justify="between"
        shrink={false}
        border="bottom"
      >
        <TerminalConnectionStatus />
        <HStack
          gap="xs"
          innerSpaceX="xs"
        >
          <FontSizeControls
            fontSize={fontSize}
            onIncrease={increaseFontSize}
            onDecrease={decreaseFontSize}
          />
          <Badge
            variant="outline"
            colorScheme="info"
          >
            <Eye className="mr-1 h-3 w-3" />
            Viewing
          </Badge>
        </HStack>
      </HStack>
      <Flex
        grow
        minW0
      >
        <Box
          minW0
          grow
        >
          <TerminalEmulator
            sessionId={String(session.sessionId)}
            fontSize={fontSize}
            readOnly
            shareToken={shareToken}
          />
        </Box>
        <Box
          shrink={false}
          maxWidth="sm"
        >
          <SuggestionSidebar
            sessionId={String(session.sessionId)}
            organizationId={session.organizationId}
          />
        </Box>
      </Flex>
    </Stack>
  );
}

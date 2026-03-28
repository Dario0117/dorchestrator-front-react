import { Badge } from '@components/ds/atoms/badge';
import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { CodeText } from '@components/ds/atoms/code-text';
import { HStack } from '@components/ds/atoms/hstack';
import { Scrollable } from '@components/ds/atoms/scrollable';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { SmallText } from '@components/ds/atoms/small-text';
import { Stack } from '@components/ds/atoms/stack';
import { Surface } from '@components/ds/atoms/surface';
import { queryClient } from '@domains/shared/context/query.provider';
import { useListSessionSuggestionsQuery } from '@domains/terminal/services/list-session-suggestions.http-service';
import { useRespondToSuggestionMutation } from '@domains/terminal/services/respond-to-suggestion.http-service';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { RT } from '@domains/terminal/services/ws-messages.schema';
import { Check, Lightbulb, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';

const SUGGESTIONS_QUERY_KEY = [
  'get',
  '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
] as const;

export function SuggestionNotificationPanel({
  sessionId,
  organizationId,
}: {
  sessionId: string;
  organizationId: string;
}) {
  const { data, isLoading } = useListSessionSuggestionsQuery(
    organizationId,
    Number(sessionId),
  );

  const respondMutation = useRespondToSuggestionMutation();

  const suggestions = data?.responseData?.results ?? [];

  const invalidateSuggestions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...SUGGESTIONS_QUERY_KEY] });
  }, []);

  // Refetch on WS notification signals
  useEffect(() => {
    const unsubNotify = terminalWsClient.onMessage(
      RT.SUGGESTION_NOTIFY,
      (msg) => {
        if (msg.sessionId !== sessionId) {
          return;
        }
        invalidateSuggestions();
      },
    );
    return unsubNotify;
  }, [sessionId, invalidateSuggestions]);

  const handleRespond = useCallback(
    (suggestionId: number, action: 'accept' | 'dismiss') => {
      respondMutation.mutate(
        {
          params: {
            path: {
              organizationId,
              sessionId: Number(sessionId),
              suggestionId,
            },
          },
          body: { action },
        },
        {
          onSuccess: () => {
            invalidateSuggestions();
          },
        },
      );
    },
    [organizationId, sessionId, respondMutation, invalidateSuggestions],
  );

  if (isLoading || suggestions.length === 0) {
    return null;
  }

  const pendingCount = suggestions.filter(
    (s) => s.response === 'pending',
  ).length;

  return (
    <Surface
      shrink={false}
      border="bottom"
    >
      <HStack
        gap="sm"
        justify="between"
        innerSpaceX="sm"
        innerSpaceY="xs"
      >
        <HStack gap="sm">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          <SmallText
            color="muted"
            weight="medium"
          >
            Suggestions
            {pendingCount > 0 && (
              <Badge
                variant="outline"
                colorScheme="warning"
              >
                {pendingCount}
              </Badge>
            )}
          </SmallText>
        </HStack>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={invalidateSuggestions}
          title="Refresh suggestions"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </HStack>
      <Scrollable
        innerSpaceX="sm"
        innerSpaceBelow="sm"
        maxH="xs"
        overflowY="auto"
      >
        <Stack gap="xs">
          {suggestions.map((s) => (
            <HStack
              gap="sm"
              align="stretch"
              border="all"
              rounded="sm"
              innerSpaceX="xs"
              innerSpaceY="xs"
              textSize="xs"
              key={s.id}
            >
              <Box
                minW0
                grow
              >
                <SecondaryParagraph>{s.suggesterName}</SecondaryParagraph>
                <CodeText block>{s.suggestionText}</CodeText>
              </Box>
              <HStack
                gap="xs"
                shrink={false}
              >
                {s.response === 'pending' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      color="success"
                      onClick={() => handleRespond(s.id, 'accept')}
                      disabled={respondMutation.isPending}
                      title="Accept and paste"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      color="danger"
                      onClick={() => handleRespond(s.id, 'dismiss')}
                      disabled={respondMutation.isPending}
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                {s.response === 'accepted' && (
                  <Badge
                    variant="outline"
                    colorScheme="success"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Accepted
                  </Badge>
                )}
                {s.response === 'dismissed' && (
                  <Badge
                    variant="outline"
                    colorScheme="neutral"
                  >
                    Dismissed
                  </Badge>
                )}
              </HStack>
            </HStack>
          ))}
        </Stack>
      </Scrollable>
    </Surface>
  );
}

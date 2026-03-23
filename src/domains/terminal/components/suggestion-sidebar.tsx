import { Badge } from '@components/ds/atoms/badge';
import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { InlineCode } from '@components/ds/atoms/inline-code';
import { Input } from '@components/ds/atoms/input';
import { InsetPanel } from '@components/ds/atoms/inset-panel';
import { Scrollable } from '@components/ds/atoms/scrollable';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { Surface } from '@components/ds/atoms/surface';
import { queryClient } from '@domains/shared/context/query.provider';
import { useListSessionSuggestionsQuery } from '@domains/terminal/services/list-session-suggestions.http-service';
import { useSubmitSuggestionMutation } from '@domains/terminal/services/submit-suggestion.http-service';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { Check, RefreshCw, Send, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SUGGESTION_LENGTH = 1000;

const SUGGESTIONS_QUERY_KEY = [
  'get',
  '/api/v1/{organizationId}/terminal/sessions/{sessionId}/suggestions',
] as const;

export function SuggestionSidebar({
  sessionId,
  organizationId,
}: {
  sessionId: string;
  organizationId: string;
}) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useListSessionSuggestionsQuery(
    organizationId,
    Number(sessionId),
  );

  const submitMutation = useSubmitSuggestionMutation();

  const suggestions = data?.responseData?.results ?? [];

  const invalidateSuggestions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...SUGGESTIONS_QUERY_KEY] });
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    submitMutation.mutate({
      params: {
        path: { organizationId, sessionId: Number(sessionId) },
      },
      body: { suggestionText: trimmed },
    });
    setText('');
    inputRef.current?.focus();
  }, [organizationId, sessionId, text, submitMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // Refetch suggestions when WS notifications arrive
  useEffect(() => {
    const unsubAccepted = terminalWsClient.onMessage(
      'suggestion:accepted',
      (msg) => {
        if (msg.sessionId !== sessionId) {
          return;
        }
        invalidateSuggestions();
      },
    );
    const unsubDismissed = terminalWsClient.onMessage(
      'suggestion:dismissed',
      (msg) => {
        if (msg.sessionId !== sessionId) {
          return;
        }
        invalidateSuggestions();
      },
    );
    return () => {
      unsubAccepted();
      unsubDismissed();
    };
  }, [sessionId, invalidateSuggestions]);

  return (
    <Stack
      fullHeight
      border="left"
    >
      <Surface
        shrink={false}
        border="bottom"
        innerSpaceX="sm"
        innerSpaceY="xs"
      >
        <HStack justify="between">
          <SectionTitle size="sm">Suggest Commands</SectionTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={invalidateSuggestions}
            title="Refresh suggestions"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </HStack>
      </Surface>
      <HStack
        gap="xs"
        align="stretch"
        shrink={false}
        border="bottom"
        innerSpaceX="xs"
        innerSpaceY="xs"
      >
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) =>
            setText(e.target.value.slice(0, MAX_SUGGESTION_LENGTH))
          }
          onKeyDown={handleKeyDown}
          placeholder="Type a command suggestion..."
          inputSize="xs"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSubmit}
          disabled={text.trim().length === 0 || submitMutation.isPending}
          aria-label="Send suggestion"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </HStack>
      <Scrollable
        grow
        innerSpaceX="xs"
        innerSpaceY="xs"
        overflowY="auto"
      >
        {text.length > 0 && (
          <SmallParagraph
            spaceBelow="sm"
            textAlign="right"
          >
            {text.length}/{MAX_SUGGESTION_LENGTH}
          </SmallParagraph>
        )}
        {isLoading ? (
          <SmallParagraph
            centered
            innerSpaceY="md"
          >
            Loading suggestions...
          </SmallParagraph>
        ) : suggestions.length === 0 ? (
          <SmallParagraph
            centered
            innerSpaceY="md"
          >
            No suggestions sent yet
          </SmallParagraph>
        ) : (
          <Stack gap="sm">
            {suggestions.map((s) => (
              <InsetPanel
                rounded="sm"
                innerSpace="xs"
                key={s.id}
              >
                <InlineCode>{s.suggestionText}</InlineCode>
                <Box spaceAbove="xs">
                  {s.response === 'pending' && (
                    <Badge
                      variant="outline"
                      colorScheme="warning"
                    >
                      Pending
                    </Badge>
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
                      colorScheme="error"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Dismissed
                    </Badge>
                  )}
                </Box>
              </InsetPanel>
            ))}
          </Stack>
        )}
      </Scrollable>
    </Stack>
  );
}

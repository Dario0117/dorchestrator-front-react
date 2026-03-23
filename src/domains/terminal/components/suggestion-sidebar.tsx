import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import { SmallParagraph } from '@components/ds/atoms/small-paragraph';
import { queryClient } from '@domains/shared/context/query.provider';
import { useListSessionSuggestionsQuery } from '@domains/terminal/services/list-session-suggestions.http-service';
import { useSubmitSuggestionMutation } from '@domains/terminal/services/submit-suggestion.http-service';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { badgeStyles } from '@lib/badge-styles';
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
    <div className="flex h-full flex-col border-l">
      <div className="shrink-0 border-b px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Suggest Commands</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={invalidateSuggestions}
            className="h-6 w-6 p-0"
            title="Refresh suggestions"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex shrink-0 gap-1 border-b p-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) =>
            setText(e.target.value.slice(0, MAX_SUGGESTION_LENGTH))
          }
          onKeyDown={handleKeyDown}
          placeholder="Type a command suggestion..."
          className="h-8 text-xs"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSubmit}
          disabled={text.trim().length === 0 || submitMutation.isPending}
          className="h-8 w-8 shrink-0 p-0"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {text.length > 0 && (
          <SmallParagraph className="mb-1 text-right">
            {text.length}/{MAX_SUGGESTION_LENGTH}
          </SmallParagraph>
        )}
        {isLoading ? (
          <SmallParagraph className="py-4 text-center">
            Loading suggestions...
          </SmallParagraph>
        ) : suggestions.length === 0 ? (
          <SmallParagraph className="py-4 text-center">
            No suggestions sent yet
          </SmallParagraph>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded border p-2 text-xs"
              >
                <code className="break-all">{s.suggestionText}</code>
                <div className="mt-1">
                  {s.response === 'pending' && (
                    <Badge
                      variant="outline"
                      className={badgeStyles.yellow}
                    >
                      Pending
                    </Badge>
                  )}
                  {s.response === 'accepted' && (
                    <Badge
                      variant="outline"
                      className={badgeStyles.green}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Accepted
                    </Badge>
                  )}
                  {s.response === 'dismissed' && (
                    <Badge
                      variant="outline"
                      className={badgeStyles.red}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Dismissed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

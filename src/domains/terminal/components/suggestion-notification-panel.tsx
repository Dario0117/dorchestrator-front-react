import { Badge } from '@components/ds/atoms/badge';
import { Button } from '@components/ds/atoms/button';
import { queryClient } from '@domains/shared/context/query.provider';
import { useListSessionSuggestionsQuery } from '@domains/terminal/services/list-session-suggestions.http-service';
import { useRespondToSuggestionMutation } from '@domains/terminal/services/respond-to-suggestion.http-service';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { badgeStyles } from '@lib/badge-styles';
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
      'suggestion:notify',
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
    <div className="shrink-0 border-b">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium">
          Suggestions
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className={`ml-1 ${badgeStyles.yellow}`}
            >
              {pendingCount}
            </Badge>
          )}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={invalidateSuggestions}
          className="ml-auto"
          title="Refresh suggestions"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      <div className="max-h-40 overflow-y-auto px-3 pb-2">
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="flex items-start gap-2 rounded border p-2 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground">{s.suggesterName}</p>
                <code className="mt-0.5 block break-all font-mono">
                  {s.suggestionText}
                </code>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {s.response === 'pending' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRespond(s.id, 'accept')}
                      disabled={respondMutation.isPending}
                      className="text-green-600 hover:text-green-700"
                      title="Accept and paste"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRespond(s.id, 'dismiss')}
                      disabled={respondMutation.isPending}
                      className="text-muted-foreground hover:text-destructive"
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
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
                    className="text-muted-foreground"
                  >
                    Dismissed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

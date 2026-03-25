import { Button } from '@components/ds/atoms/button';
import { Center } from '@components/ds/atoms/center';
import { Positioned } from '@components/ds/atoms/positioned';
import { SecondaryParagraph } from '@components/ds/atoms/secondary-paragraph';
import { Stack } from '@components/ds/atoms/stack';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { SpinnerIcon } from '@phosphor-icons/react';
import { RefreshCw, WifiOff } from 'lucide-react';

export function TerminalConnectionOverlay({
  onReconnect,
}: {
  onReconnect?: () => void;
}) {
  const connectionState = useTerminalConnectionStore((s) => s.connectionState);
  const reconnectAttempt = useTerminalConnectionStore(
    (s) => s.reconnectAttempt,
  );

  if (connectionState === 'connected') {
    return null;
  }

  const isReconnecting =
    connectionState === 'reconnecting' || connectionState === 'connecting';

  return (
    <Positioned
      position="absolute"
      inset0
    >
      <Center
        fullHeight
        fullWidth
        bg="muted/50"
        aria-live="polite"
      >
        <Stack
          gap="sm"
          align="center"
        >
          {isReconnecting ? (
            <>
              <SpinnerIcon className="size-8 text-muted-foreground" />
              <SecondaryParagraph>
                {connectionState === 'reconnecting'
                  ? `Reconnecting${reconnectAttempt > 0 ? ` (attempt ${reconnectAttempt})` : ''}\u2026`
                  : 'Connecting\u2026'}
              </SecondaryParagraph>
            </>
          ) : (
            <>
              <WifiOff className="h-8 w-8 text-muted-foreground" />
              <SecondaryParagraph>Connection lost</SecondaryParagraph>
              {onReconnect && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onReconnect}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Reconnect
                </Button>
              )}
            </>
          )}
        </Stack>
      </Center>
    </Positioned>
  );
}

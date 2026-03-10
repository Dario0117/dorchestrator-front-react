import { cn } from '@lib/utils';
import { useTerminalConnectionStore } from '@stores/terminal-connection.store';
import type { ConnectionState } from '@stores/terminal-connection.store.types';

const STATUS_CONFIG = {
  connected: { label: 'Connected', dotClass: 'bg-green-500', animate: false },
  connecting: {
    label: 'Connecting...',
    dotClass: 'bg-yellow-500',
    animate: false,
  },
  reconnecting: {
    label: 'Reconnecting...',
    dotClass: 'bg-yellow-500',
    animate: true,
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-red-500',
    animate: false,
  },
} as const satisfies Record<
  ConnectionState,
  { label: string; dotClass: string; animate: boolean }
>;

export function TerminalConnectionStatus() {
  const connectionState = useTerminalConnectionStore((s) => s.connectionState);
  const reconnectAttempt = useTerminalConnectionStore(
    (s) => s.reconnectAttempt,
  );

  const config = STATUS_CONFIG[connectionState];

  return (
    <output
      className="flex min-h-[44px] min-w-[44px] items-center gap-2 px-3 py-2"
      aria-live="polite"
    >
      <span
        className={cn('h-2.5 w-2.5 rounded-full', config.dotClass, {
          'animate-pulse': config.animate,
        })}
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">
        {config.label}
        {connectionState === 'reconnecting' && reconnectAttempt > 0
          ? ` (attempt ${reconnectAttempt})`
          : null}
      </span>
    </output>
  );
}

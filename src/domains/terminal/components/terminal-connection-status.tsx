import { Output } from '@components/ds/atoms/output';
import { SecondaryText } from '@components/ds/atoms/secondary-text';
import type { StatusDotProps } from '@components/ds/atoms/status-dot';
import { StatusDot } from '@components/ds/atoms/status-dot';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import type { ConnectionState } from '@domains/terminal/stores/terminal-connection.store.types';

const STATUS_CONFIG = {
  connected: { label: 'Connected', status: 'online' as const },
  connecting: { label: 'Connecting...', status: 'pending' as const },
  reconnecting: { label: 'Reconnecting...', status: 'pending' as const },
  disconnected: { label: 'Disconnected', status: 'error' as const },
} as const satisfies Record<
  ConnectionState,
  { label: string; status: NonNullable<StatusDotProps['status']> }
>;

export function TerminalConnectionStatus() {
  const connectionState = useTerminalConnectionStore((s) => s.connectionState);
  const reconnectAttempt = useTerminalConnectionStore(
    (s) => s.reconnectAttempt,
  );

  const config = STATUS_CONFIG[connectionState];

  return (
    <Output
      variant="status"
      aria-live="polite"
    >
      <StatusDot
        size="lg"
        status={config.status}
        aria-label={`Connection status: ${config.label}`}
      />
      <SecondaryText>
        {config.label}
        {connectionState === 'reconnecting' && reconnectAttempt > 0
          ? ` (attempt ${reconnectAttempt})`
          : null}
      </SecondaryText>
    </Output>
  );
}

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export interface TerminalConnectionStore {
  connectionState: ConnectionState;
  lastConnectedAt: Date | null;
  lastError: string | null;
  reconnectAttempt: number;
  setConnectionState: (state: ConnectionState) => void;
  setError: (error: string | null) => void;
  incrementReconnectAttempt: () => void;
  resetReconnectAttempt: () => void;
}

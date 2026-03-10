import type {
  ConnectionState,
  TerminalConnectionStore,
} from '@stores/terminal-connection.store.types';
import { create } from 'zustand';

export const useTerminalConnectionStore = create<TerminalConnectionStore>(
  (set) => ({
    connectionState: 'disconnected',
    lastConnectedAt: null,
    lastError: null,
    reconnectAttempt: 0,

    setConnectionState: (state: ConnectionState) =>
      set({
        connectionState: state,
        ...(state === 'connected' ? { lastConnectedAt: new Date() } : {}),
      }),

    setError: (error: string | null) => set({ lastError: error }),

    incrementReconnectAttempt: () =>
      set((prev) => ({ reconnectAttempt: prev.reconnectAttempt + 1 })),

    resetReconnectAttempt: () => set({ reconnectAttempt: 0 }),
  }),
);

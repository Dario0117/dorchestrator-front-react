import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';

describe('terminal-connection.store', () => {
  beforeEach(() => {
    useTerminalConnectionStore.setState({
      connectionState: 'disconnected',
      lastConnectedAt: null,
      lastError: null,
      reconnectAttempt: 0,
    });
  });

  test('initial state is disconnected with no errors', () => {
    const state = useTerminalConnectionStore.getState();
    expect(state.connectionState).toBe('disconnected');
    expect(state.lastConnectedAt).toBeNull();
    expect(state.lastError).toBeNull();
    expect(state.reconnectAttempt).toBe(0);
  });

  test('setConnectionState updates state correctly', () => {
    const { setConnectionState } = useTerminalConnectionStore.getState();
    setConnectionState('connecting');
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connecting',
    );
  });

  test('setConnectionState to connected sets lastConnectedAt', () => {
    const { setConnectionState } = useTerminalConnectionStore.getState();
    setConnectionState('connected');
    const state = useTerminalConnectionStore.getState();
    expect(state.connectionState).toBe('connected');
    expect(state.lastConnectedAt).toBeInstanceOf(Date);
  });

  test('setConnectionState to reconnecting does not set lastConnectedAt', () => {
    const { setConnectionState } = useTerminalConnectionStore.getState();
    setConnectionState('reconnecting');
    expect(useTerminalConnectionStore.getState().lastConnectedAt).toBeNull();
  });

  test('setError stores error message', () => {
    const { setError } = useTerminalConnectionStore.getState();
    setError('Connection refused');
    expect(useTerminalConnectionStore.getState().lastError).toBe(
      'Connection refused',
    );
  });

  test('setError clears error with null', () => {
    const store = useTerminalConnectionStore.getState();
    store.setError('some error');
    store.setError(null);
    expect(useTerminalConnectionStore.getState().lastError).toBeNull();
  });

  test('incrementReconnectAttempt increments counter', () => {
    const { incrementReconnectAttempt } = useTerminalConnectionStore.getState();
    incrementReconnectAttempt();
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(1);
    incrementReconnectAttempt();
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(2);
  });

  test('resetReconnectAttempt resets to 0', () => {
    const store = useTerminalConnectionStore.getState();
    store.incrementReconnectAttempt();
    store.incrementReconnectAttempt();
    store.resetReconnectAttempt();
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(0);
  });
});

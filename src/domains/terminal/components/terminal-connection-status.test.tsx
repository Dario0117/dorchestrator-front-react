import { TerminalConnectionStatus } from '@domains/terminal/components/terminal-connection-status';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen } from '@testing-library/react';

describe('TerminalConnectionStatus', () => {
  beforeEach(() => {
    useTerminalConnectionStore.setState({
      connectionState: 'disconnected',
      lastConnectedAt: null,
      lastError: null,
      reconnectAttempt: 0,
    });
  });

  test('renders "Connected" with status role when connected', () => {
    useTerminalConnectionStore.setState({ connectionState: 'connected' });
    renderWithProviders(<TerminalConnectionStatus />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders "Connecting..." when connecting', () => {
    useTerminalConnectionStore.setState({ connectionState: 'connecting' });
    renderWithProviders(<TerminalConnectionStatus />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  test('renders "Reconnecting..." with attempt count when reconnecting', () => {
    useTerminalConnectionStore.setState({
      connectionState: 'reconnecting',
      reconnectAttempt: 3,
    });
    renderWithProviders(<TerminalConnectionStatus />);
    expect(screen.getByText('Reconnecting... (attempt 3)')).toBeInTheDocument();
  });

  test('renders "Disconnected" when disconnected', () => {
    useTerminalConnectionStore.setState({ connectionState: 'disconnected' });
    renderWithProviders(<TerminalConnectionStatus />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  test('updates reactively when store state changes', () => {
    renderWithProviders(<TerminalConnectionStatus />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();

    act(() => {
      useTerminalConnectionStore.setState({ connectionState: 'connected' });
    });
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});

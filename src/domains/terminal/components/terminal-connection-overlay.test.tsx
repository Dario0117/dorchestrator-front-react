import { TerminalConnectionOverlay } from '@domains/terminal/components/terminal-connection-overlay';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('TerminalConnectionOverlay', () => {
  afterEach(() => {
    useTerminalConnectionStore.setState({
      connectionState: 'connected',
      reconnectAttempt: 0,
    });
  });

  it('renders nothing when connected', () => {
    useTerminalConnectionStore.setState({ connectionState: 'connected' });
    const { container } = renderWithProviders(<TerminalConnectionOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('shows connecting message', () => {
    useTerminalConnectionStore.setState({ connectionState: 'connecting' });
    renderWithProviders(<TerminalConnectionOverlay />);
    expect(screen.getByText(/Connecting/)).toBeInTheDocument();
  });

  it('shows reconnecting message without attempt count when attempt is 0', () => {
    useTerminalConnectionStore.setState({
      connectionState: 'reconnecting',
      reconnectAttempt: 0,
    });
    renderWithProviders(<TerminalConnectionOverlay />);
    expect(screen.getByText('Reconnecting\u2026')).toBeInTheDocument();
  });

  it('shows reconnecting message with attempt count', () => {
    useTerminalConnectionStore.setState({
      connectionState: 'reconnecting',
      reconnectAttempt: 3,
    });
    renderWithProviders(<TerminalConnectionOverlay />);
    expect(screen.getByText(/Reconnecting.*attempt 3/)).toBeInTheDocument();
  });

  it('shows connection lost when disconnected', () => {
    useTerminalConnectionStore.setState({ connectionState: 'disconnected' });
    renderWithProviders(<TerminalConnectionOverlay />);
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });

  it('shows reconnect button when disconnected and onReconnect provided', () => {
    useTerminalConnectionStore.setState({ connectionState: 'disconnected' });
    renderWithProviders(<TerminalConnectionOverlay onReconnect={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /Reconnect/ }),
    ).toBeInTheDocument();
  });

  it('does not show reconnect button when no callback provided', () => {
    useTerminalConnectionStore.setState({ connectionState: 'disconnected' });
    renderWithProviders(<TerminalConnectionOverlay />);
    expect(
      screen.queryByRole('button', { name: /Reconnect/ }),
    ).not.toBeInTheDocument();
  });

  it('calls onReconnect when button clicked', async () => {
    const onReconnect = vi.fn();
    const user = userEvent.setup();
    useTerminalConnectionStore.setState({ connectionState: 'disconnected' });
    renderWithProviders(
      <TerminalConnectionOverlay onReconnect={onReconnect} />,
    );
    await user.click(screen.getByRole('button', { name: /Reconnect/ }));
    expect(onReconnect).toHaveBeenCalledOnce();
  });
});

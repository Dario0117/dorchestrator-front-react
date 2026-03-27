import { SessionViewerList } from '@domains/terminal/components/session-viewer-list';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import type {
  ViewerJoinMessage,
  ViewerLeaveMessage,
  ViewerListMessage,
  WsMessageType,
} from '@domains/terminal/services/ws-messages.schema';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen } from '@testing-library/react';

type AnyHandler = (message: never) => void;

let capturedHandlers: Partial<Record<WsMessageType, AnyHandler>>;
let onMessageSpy: ReturnType<typeof vi.spyOn>;
let sendSpy: ReturnType<typeof vi.spyOn>;

function fireViewerJoin(msg: ViewerJoinMessage) {
  const handler = capturedHandlers['viewer:join'];
  if (handler) {
    act(() => handler(msg as never));
  }
}

function fireViewerLeave(msg: ViewerLeaveMessage) {
  const handler = capturedHandlers['viewer:leave'];
  if (handler) {
    act(() => handler(msg as never));
  }
}

function fireViewerList(msg: ViewerListMessage) {
  const handler = capturedHandlers['viewer:list'];
  if (handler) {
    act(() => handler(msg as never));
  }
}

beforeEach(() => {
  capturedHandlers = {};

  onMessageSpy = vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(((
    type: WsMessageType,
    handler: AnyHandler,
  ) => {
    capturedHandlers[type] = handler;
    return vi.fn();
  }) as typeof terminalWsClient.onMessage);

  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop stub
  sendSpy = vi.spyOn(terminalWsClient, 'send').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SessionViewerList', () => {
  test('renders nothing when there are no viewers', () => {
    const { container } = renderWithProviders(
      <SessionViewerList sessionId="session-1" />,
    );

    expect(container.firstChild).toBeNull();
  });

  test('subscribes to viewer:join, viewer:leave, and viewer:list on mount', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    expect(onMessageSpy).toHaveBeenCalledWith(
      'viewer:join',
      expect.any(Function),
    );
    expect(onMessageSpy).toHaveBeenCalledWith(
      'viewer:leave',
      expect.any(Function),
    );
    expect(onMessageSpy).toHaveBeenCalledWith(
      'viewer:list',
      expect.any(Function),
    );
  });

  test('sends viewer:list:request on mount', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'viewer:list:request',
      sessionId: 'session-1',
    });
  });

  test('unsubscribes from all events on unmount', () => {
    const unsubJoin = vi.fn();
    const unsubLeave = vi.fn();
    const unsubList = vi.fn();

    onMessageSpy.mockImplementation(((type: WsMessageType) => {
      if (type === 'viewer:join') {
        return unsubJoin;
      }
      if (type === 'viewer:leave') {
        return unsubLeave;
      }
      return unsubList;
    }) as typeof terminalWsClient.onMessage);

    const { unmount } = renderWithProviders(
      <SessionViewerList sessionId="session-1" />,
    );

    unmount();

    expect(unsubJoin).toHaveBeenCalled();
    expect(unsubLeave).toHaveBeenCalled();
    expect(unsubList).toHaveBeenCalled();
  });

  test('shows viewer count when viewer:join is received', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    expect(screen.getByText('1 viewer')).toBeInTheDocument();
  });

  test('shows plural viewers when multiple join', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-2', displayName: 'Bob' },
    });

    expect(screen.getByText('2 viewers')).toBeInTheDocument();
  });

  test('ignores viewer:join for a different session', () => {
    const { container } = renderWithProviders(
      <SessionViewerList sessionId="session-1" />,
    );

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-other',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    expect(container.firstChild).toBeNull();
  });

  test('does not duplicate viewer on repeated join', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    expect(screen.getByText('1 viewer')).toBeInTheDocument();
  });

  test('removes viewer on viewer:leave', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    expect(screen.getByText('1 viewer')).toBeInTheDocument();

    fireViewerLeave({
      type: 'viewer:leave',
      sessionId: 'session-1',
      payload: { userId: 'user-1' },
    });

    expect(screen.queryByText(/viewer/)).not.toBeInTheDocument();
  });

  test('ignores viewer:leave for a different session', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    fireViewerLeave({
      type: 'viewer:leave',
      sessionId: 'session-other',
      payload: { userId: 'user-1' },
    });

    expect(screen.getByText('1 viewer')).toBeInTheDocument();
  });

  test('ignores viewer:leave when payload is missing', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerJoin({
      type: 'viewer:join',
      sessionId: 'session-1',
      payload: { userId: 'user-1', displayName: 'Alice' },
    });

    fireViewerLeave({
      type: 'viewer:leave',
      sessionId: 'session-1',
    });

    expect(screen.getByText('1 viewer')).toBeInTheDocument();
  });

  test('sets viewers from viewer:list', () => {
    renderWithProviders(<SessionViewerList sessionId="session-1" />);

    fireViewerList({
      type: 'viewer:list',
      sessionId: 'session-1',
      payload: {
        viewers: [
          { userId: 'user-1', displayName: 'Alice' },
          { userId: 'user-2', displayName: 'Bob' },
          { userId: 'user-3', displayName: 'Charlie' },
        ],
      },
    });

    expect(screen.getByText('3 viewers')).toBeInTheDocument();
  });

  test('ignores viewer:list for a different session', () => {
    const { container } = renderWithProviders(
      <SessionViewerList sessionId="session-1" />,
    );

    fireViewerList({
      type: 'viewer:list',
      sessionId: 'session-other',
      payload: {
        viewers: [{ userId: 'user-1', displayName: 'Alice' }],
      },
    });

    expect(container.firstChild).toBeNull();
  });
});

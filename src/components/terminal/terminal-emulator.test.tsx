import { TerminalEmulator } from '@components/terminal/terminal-emulator';
import type { TerminalEmulatorHandle } from '@components/terminal/terminal-emulator.types';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { terminalWsClient } from '@services/terminal/terminal-ws.client';
import { screen } from '@testing-library/react';
import { createRef } from 'react';

const RESIZE_DEBOUNCE_MS = 100;

// Mock xterm.js and addons at the module level
const mockTerminalWrite = vi.fn();
const mockTerminalOpen = vi.fn();
const mockTerminalDispose = vi.fn();
const mockTerminalReset = vi.fn();
const mockTerminalFocus = vi.fn();
const mockTerminalOnData = vi.fn().mockReturnValue({ dispose: vi.fn() });
const mockLoadAddon = vi.fn();
let mockTerminalCols = 80;
let mockTerminalRows = 24;

vi.mock('@xterm/xterm', () => {
  function MockTerminal() {
    return {
      open: mockTerminalOpen,
      write: mockTerminalWrite,
      dispose: mockTerminalDispose,
      reset: mockTerminalReset,
      onData: mockTerminalOnData,
      loadAddon: mockLoadAddon,
      focus: mockTerminalFocus,
      options: { fontSize: 14 },
      get cols() {
        return mockTerminalCols;
      },
      get rows() {
        return mockTerminalRows;
      },
    };
  }
  return { Terminal: MockTerminal };
});

vi.mock('@xterm/addon-fit', () => {
  function MockFitAddon() {
    return { fit: vi.fn(), dispose: vi.fn() };
  }
  return { FitAddon: MockFitAddon };
});

vi.mock('@xterm/addon-webgl', () => {
  function MockWebglAddon() {
    return { dispose: vi.fn() };
  }
  return { WebglAddon: MockWebglAddon };
});

vi.mock('@xterm/addon-web-links', () => {
  function MockWebLinksAddon() {
    return { dispose: vi.fn() };
  }
  return { WebLinksAddon: MockWebLinksAddon };
});

// Track WS client calls
const connectSpy = vi.spyOn(terminalWsClient, 'connect');
const connectForEventsSpy = vi.spyOn(terminalWsClient, 'connectForEvents');
const sendSpy = vi.spyOn(terminalWsClient, 'send');
const onMessageSpy = vi.spyOn(terminalWsClient, 'onMessage');

describe('TerminalEmulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTerminalCols = 80;
    mockTerminalRows = 24;
    onMessageSpy.mockReturnValue(vi.fn());
  });

  it('should render a terminal container', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(screen.getByTestId('terminal-container')).toBeInTheDocument();
  });

  it('should create xterm.js Terminal instance and open it', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(mockTerminalOpen).toHaveBeenCalled();
  });

  it('should connect WebSocket using cookie-based auth', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(connectSpy).toHaveBeenCalledWith(undefined);
  });

  it('should show connecting message before authentication', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(mockTerminalWrite).toHaveBeenCalledWith('Connecting...\r\n');
  });

  it('should not register onData before authentication', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(mockTerminalOnData).not.toHaveBeenCalled();
  });

  it('should register onData after heartbeat:ping and send pty:input', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    // Simulate first heartbeat:ping to trigger auth
    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    const pingHandler = pingCall?.[1];
    pingHandler?.({ type: 'heartbeat:ping' });

    expect(mockTerminalOnData).toHaveBeenCalled();
    const onDataHandler = mockTerminalOnData.mock.calls[0]?.[0];

    onDataHandler('hello');

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'pty:input',
      sessionId: 'session-1',
      data: 'hello',
    });
  });

  it('should subscribe to pty:output messages', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(onMessageSpy).toHaveBeenCalledWith(
      'pty:output',
      expect.any(Function),
    );
  });

  it('should write pty:output data to terminal when sessionId matches', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    const outputCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'pty:output',
    );
    const outputHandler = outputCall?.[1];

    outputHandler?.({
      type: 'pty:output',
      sessionId: 'session-1',
      data: 'output data',
    });

    expect(mockTerminalWrite).toHaveBeenCalledWith('output data');
  });

  it('should not write pty:output data when sessionId does not match', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    // Clear the initial 'Connecting...' write
    mockTerminalWrite.mockClear();

    const outputCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'pty:output',
    );
    const outputHandler = outputCall?.[1];

    outputHandler?.({
      type: 'pty:output',
      sessionId: 'other-session',
      data: 'output data',
    });

    expect(mockTerminalWrite).not.toHaveBeenCalled();
  });

  it('should subscribe to session:close messages', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    expect(onMessageSpy).toHaveBeenCalledWith(
      'session:close',
      expect.any(Function),
    );
  });

  it('should call onSessionEnd and write termination message on session:close', () => {
    const onSessionEnd = vi.fn();
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionEnd={onSessionEnd}
      />,
    );

    const closeCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:close',
    );
    const closeHandler = closeCall?.[1];

    closeHandler?.({
      type: 'session:close',
      sessionId: 'session-1',
      deviceId: 42,
    });

    expect(mockTerminalWrite).toHaveBeenCalledWith(
      '\r\n[Session terminated]\r\n',
    );
    expect(onSessionEnd).toHaveBeenCalledWith(42);
  });

  it('should send pty:resize on heartbeat:ping', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    expect(pingCall).toBeDefined();
    const pingHandler = pingCall?.[1];

    pingHandler?.({ type: 'heartbeat:ping' });

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'pty:resize',
      sessionId: 'session-1',
      payload: {
        cols: 80,
        rows: 24,
      },
    });
  });

  it('should clear terminal on first ping without sending newline', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    const pingHandler = pingCall?.[1];

    pingHandler?.({ type: 'heartbeat:ping' });

    expect(mockTerminalReset).toHaveBeenCalled();
    expect(sendSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'pty:input', data: '\n' }),
    );
  });

  it('should disconnect WS and dispose terminal on unmount', () => {
    const { unmount } = renderWithProviders(
      <TerminalEmulator sessionId="session-1" />,
    );

    unmount();

    expect(connectForEventsSpy).toHaveBeenCalled();
    expect(mockTerminalDispose).toHaveBeenCalled();
  });

  it('should unsubscribe from WS messages on unmount', () => {
    const unsubOutput = vi.fn();
    const unsubClose = vi.fn();

    onMessageSpy
      .mockReturnValueOnce(unsubOutput)
      .mockReturnValueOnce(unsubClose);

    const { unmount } = renderWithProviders(
      <TerminalEmulator sessionId="session-1" />,
    );

    unmount();

    expect(unsubOutput).toHaveBeenCalled();
    expect(unsubClose).toHaveBeenCalled();
  });

  it('should not call onSessionEnd for session:close with different sessionId', () => {
    const onSessionEnd = vi.fn();
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionEnd={onSessionEnd}
      />,
    );

    const closeCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:close',
    );
    const closeHandler = closeCall?.[1];

    closeHandler?.({
      type: 'session:close',
      sessionId: 'other-session',
    });

    expect(onSessionEnd).not.toHaveBeenCalled();
  });

  it('should expose focus method via ref', () => {
    const ref = createRef<TerminalEmulatorHandle>();
    renderWithProviders(
      <TerminalEmulator
        ref={ref}
        sessionId="session-1"
      />,
    );

    expect(ref.current).not.toBeNull();
    ref.current?.focus();
    expect(mockTerminalFocus).toHaveBeenCalled();
  });

  it('should not send pty:input or register onData in readOnly mode', () => {
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        readOnly
      />,
    );

    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    const pingHandler = pingCall?.[1];
    pingHandler?.({ type: 'heartbeat:ping' });

    expect(mockTerminalReset).toHaveBeenCalled();
    expect(mockTerminalOnData).not.toHaveBeenCalled();
    expect(sendSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'pty:input' }),
    );
  });

  it('should not send pty:resize on heartbeat:ping in readOnly mode', () => {
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        readOnly
      />,
    );

    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    const pingHandler = pingCall?.[1];
    pingHandler?.({ type: 'heartbeat:ping' });

    expect(sendSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'pty:resize' }),
    );
  });

  it('should only initialize session once on multiple heartbeat pings', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    const pingHandler = pingCall?.[1];

    pingHandler?.({ type: 'heartbeat:ping' });
    pingHandler?.({ type: 'heartbeat:ping' });

    expect(mockTerminalReset).toHaveBeenCalledTimes(1);
    expect(mockTerminalOnData).toHaveBeenCalledTimes(1);
  });

  it('should write error message to terminal on WS error', () => {
    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    const errorCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'error',
    );
    const errorHandler = errorCall?.[1];

    errorHandler?.({
      type: 'error',
      payload: { code: 'WS_ERROR', message: 'connection lost' },
    });

    expect(mockTerminalWrite).toHaveBeenCalledWith(
      '\r\n[Error: connection lost]\r\n',
    );
  });

  it('should call onSessionLocked and dispose onData on session:lock', () => {
    const onSessionLocked = vi.fn();
    const mockOnDataDispose = vi.fn();
    mockTerminalOnData.mockReturnValue({ dispose: mockOnDataDispose });

    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionLocked={onSessionLocked}
      />,
    );

    // Initialize session so onData is registered
    const pingCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'heartbeat:ping',
    );
    pingCall?.[1]?.({ type: 'heartbeat:ping' });

    const lockCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:lock',
    );
    lockCall?.[1]?.({
      type: 'session:lock',
      sessionId: 'session-1',
    });

    expect(mockOnDataDispose).toHaveBeenCalled();
    expect(onSessionLocked).toHaveBeenCalled();
  });

  it('should not call onSessionLocked for session:lock with different sessionId', () => {
    const onSessionLocked = vi.fn();
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionLocked={onSessionLocked}
      />,
    );

    const lockCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:lock',
    );
    lockCall?.[1]?.({
      type: 'session:lock',
      sessionId: 'other-session',
    });

    expect(onSessionLocked).not.toHaveBeenCalled();
  });

  it('should call onSessionWarning on session:warning', () => {
    const onSessionWarning = vi.fn();
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionWarning={onSessionWarning}
      />,
    );

    const warningCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:warning',
    );
    warningCall?.[1]?.({
      type: 'session:warning',
      sessionId: 'session-1',
      payload: { reason: 'hard_cap_expiry', remainingMs: 30000 },
    });

    expect(onSessionWarning).toHaveBeenCalledWith('hard_cap_expiry', 30000);
  });

  it('should not call onSessionWarning for session:warning with different sessionId', () => {
    const onSessionWarning = vi.fn();
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionWarning={onSessionWarning}
      />,
    );

    const warningCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:warning',
    );
    warningCall?.[1]?.({
      type: 'session:warning',
      sessionId: 'other-session',
      payload: { reason: 'hard_cap_expiry', remainingMs: 30000 },
    });

    expect(onSessionWarning).not.toHaveBeenCalled();
  });

  it('should call onSessionTerminated on session:close', () => {
    const onSessionTerminated = vi.fn();
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        onSessionTerminated={onSessionTerminated}
      />,
    );

    const closeCall = onMessageSpy.mock.calls.find(
      (call) => call[0] === 'session:close',
    );
    closeCall?.[1]?.({
      type: 'session:close',
      sessionId: 'session-1',
    });

    expect(onSessionTerminated).toHaveBeenCalled();
  });

  it('should pass shareToken to WS connect', () => {
    renderWithProviders(
      <TerminalEmulator
        sessionId="session-1"
        shareToken="tok-123"
      />,
    );

    expect(connectSpy).toHaveBeenCalledWith('tok-123');
  });

  it('should fall back to canvas renderer when WebGL is not available', () => {
    // Make loadAddon throw when loading WebglAddon (second call)
    mockLoadAddon
      .mockImplementationOnce(() => {
        // FitAddon — succeeds
      })
      .mockImplementationOnce(() => {
        throw new Error('WebGL not supported');
      }); // WebglAddon — fails

    renderWithProviders(<TerminalEmulator sessionId="session-1" />);

    // Should still open the terminal successfully
    expect(mockTerminalOpen).toHaveBeenCalled();
  });

  describe('resize observer', () => {
    let resizeCallback: (() => void) | null = null;
    const mockDisconnect = vi.fn();
    const originalResizeObserver = globalThis.ResizeObserver;

    beforeEach(() => {
      vi.useFakeTimers();
      resizeCallback = null;
      mockDisconnect.mockClear();

      globalThis.ResizeObserver = class MockResizeObserver {
        constructor(callback: () => void) {
          resizeCallback = callback;
        }
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop
        observe() {}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop
        unobserve() {}
        disconnect() {
          mockDisconnect();
        }
      } as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      vi.useRealTimers();
      globalThis.ResizeObserver = originalResizeObserver;
    });

    it('should fit terminal and send pty:resize on container resize', () => {
      renderWithProviders(<TerminalEmulator sessionId="session-1" />);

      expect(resizeCallback).not.toBeNull();
      resizeCallback?.();

      // Flush debounce timer
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);

      expect(sendSpy).toHaveBeenCalledWith({
        type: 'pty:resize',
        sessionId: 'session-1',
        payload: { cols: 80, rows: 24 },
      });
    });

    it('should debounce rapid resize events', () => {
      renderWithProviders(<TerminalEmulator sessionId="session-1" />);

      sendSpy.mockClear();

      resizeCallback?.();
      resizeCallback?.();
      resizeCallback?.();

      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);

      // Only one resize send after debounce
      const resizeCalls = sendSpy.mock.calls.filter(
        (call) => call[0].type === 'pty:resize',
      );
      expect(resizeCalls).toHaveLength(1);
    });

    it('should not send pty:resize on container resize in readOnly mode', () => {
      renderWithProviders(
        <TerminalEmulator
          sessionId="session-1"
          readOnly
        />,
      );

      sendSpy.mockClear();
      resizeCallback?.();
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);

      expect(sendSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'pty:resize' }),
      );
    });

    it('should disconnect resize observer on unmount', () => {
      const { unmount } = renderWithProviders(
        <TerminalEmulator sessionId="session-1" />,
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

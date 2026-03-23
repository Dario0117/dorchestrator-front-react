import '@xterm/xterm/css/xterm.css';

import type {
  TerminalEmulatorHandle,
  TerminalEmulatorProps,
} from '@domains/terminal/components/terminal-emulator.types';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { logError, logInfo } from '@lib/logger.utils';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { Terminal } from '@xterm/xterm';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const RESIZE_DEBOUNCE_MS = 100;

function createTerminal(
  container: HTMLDivElement,
  fontSize: number,
): { terminal: Terminal; fitAddon: FitAddon } {
  const terminal = new Terminal({
    cursorBlink: true,
    allowProposedApi: true,
    fontFamily: 'monospace',
    fontSize,
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  try {
    terminal.loadAddon(new WebglAddon());
  } catch {
    logInfo({}, 'WebGL not available, using canvas renderer');
  }

  terminal.loadAddon(new WebLinksAddon());

  terminal.open(container);
  fitAddon.fit();
  terminal.focus();

  return { terminal, fitAddon };
}

interface SessionCallbacks {
  onSessionEnd: { current: ((deviceId?: number) => void) | undefined };
  onSessionLocked: { current: (() => void) | undefined };
  onSessionWarning: {
    current: ((reason: string, remainingMs: number) => void) | undefined;
  };
  onSessionTerminated: { current: (() => void) | undefined };
}

function initializeSession(
  terminal: Terminal,
  sessionId: string,
  readOnly: boolean | undefined,
  setOnDataDisposable: (disposable: { dispose(): void }) => void,
): void {
  terminal.reset();

  if (readOnly) {
    return;
  }

  // Start forwarding user keystrokes to the server PTY.
  const disposable = terminal.onData((data) => {
    terminalWsClient.send({
      type: 'pty:input',
      sessionId,
      data,
    });
  });
  setOnDataDisposable(disposable);
}

function subscribeToWs(
  terminal: Terminal,
  sessionId: string,
  readOnly: boolean | undefined,
  shareToken: string | undefined,
  callbacks: SessionCallbacks,
): () => void {
  terminalWsClient.connect(shareToken);
  terminal.write('Connecting...\r\n');

  let onDataDisposable: { dispose(): void } | null = null;
  let initialized = false;

  const unsubHeartbeat = terminalWsClient.onMessage('heartbeat:ping', () => {
    if (!readOnly) {
      terminalWsClient.send({
        type: 'pty:resize',
        sessionId,
        payload: { cols: terminal.cols, rows: terminal.rows },
      });
    }

    if (!initialized) {
      initialized = true;
      initializeSession(terminal, sessionId, readOnly, (disposable) => {
        onDataDisposable = disposable;
      });
    }
  });

  const unsubOutput = terminalWsClient.onMessage('pty:output', (msg) => {
    if (msg.sessionId === sessionId) {
      terminal.write(msg.data);
    }
  });

  const unsubClose = terminalWsClient.onMessage('session:close', (msg) => {
    if (msg.sessionId === sessionId) {
      terminal.write('\r\n[Session terminated]\r\n');
      callbacks.onSessionTerminated.current?.();
      callbacks.onSessionEnd.current?.(msg.deviceId);
    }
  });

  const unsubError = terminalWsClient.onMessage('error', (msg) => {
    logError({ payload: msg.payload }, 'Terminal WS error');
    terminal.write(`\r\n[Error: ${msg.payload.message}]\r\n`);
  });

  const unsubLock = terminalWsClient.onMessage('session:lock', (msg) => {
    if (msg.sessionId === sessionId) {
      onDataDisposable?.dispose();
      onDataDisposable = null;
      callbacks.onSessionLocked.current?.();
    }
  });

  const unsubWarning = terminalWsClient.onMessage('session:warning', (msg) => {
    if (msg.sessionId === sessionId) {
      callbacks.onSessionWarning.current?.(
        msg.payload.reason,
        msg.payload.remainingMs,
      );
    }
  });

  return () => {
    onDataDisposable?.dispose();
    unsubHeartbeat();
    unsubOutput();
    unsubClose();
    unsubError();
    unsubLock();
    unsubWarning();
    terminalWsClient.connectForEvents();
  };
}

function observeResize(
  container: HTMLDivElement,
  fitAddon: FitAddon,
  terminal: Terminal,
  sessionId: string,
  readOnly: boolean | undefined,
): () => void {
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  const resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
      fitAddon.fit();
      if (!readOnly) {
        terminalWsClient.send({
          type: 'pty:resize',
          sessionId,
          payload: { cols: terminal.cols, rows: terminal.rows },
        });
      }
    }, RESIZE_DEBOUNCE_MS);
  });

  resizeObserver.observe(container);

  return () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeObserver.disconnect();
  };
}

export const TerminalEmulator = forwardRef<
  TerminalEmulatorHandle,
  TerminalEmulatorProps
>(function TerminalEmulator(
  {
    sessionId,
    fontSize = 14,
    readOnly,
    shareToken,
    onSessionEnd,
    onSessionLocked,
    onSessionWarning,
    onSessionTerminated,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const fontSizeRef = useRef(fontSize);
  fontSizeRef.current = fontSize;
  const onSessionEndRef = useRef(onSessionEnd);
  onSessionEndRef.current = onSessionEnd;
  const onSessionLockedRef = useRef(onSessionLocked);
  onSessionLockedRef.current = onSessionLocked;
  const onSessionWarningRef = useRef(onSessionWarning);
  onSessionWarningRef.current = onSessionWarning;
  const onSessionTerminatedRef = useRef(onSessionTerminated);
  onSessionTerminatedRef.current = onSessionTerminated;

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        terminalInstanceRef.current?.focus();
      },
    }),
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    /* v8 ignore start */
    if (!container) {
      return;
    }
    /* v8 ignore stop */

    const { terminal, fitAddon } = createTerminal(
      container,
      fontSizeRef.current,
    );
    terminalInstanceRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const cleanupWs = subscribeToWs(terminal, sessionId, readOnly, shareToken, {
      onSessionEnd: onSessionEndRef,
      onSessionLocked: onSessionLockedRef,
      onSessionWarning: onSessionWarningRef,
      onSessionTerminated: onSessionTerminatedRef,
    });

    const cleanupResize = observeResize(
      container,
      fitAddon,
      terminal,
      sessionId,
      readOnly,
    );

    return () => {
      cleanupResize();
      cleanupWs();
      terminal.dispose();
      terminalInstanceRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, readOnly, shareToken]);

  useEffect(() => {
    const terminal = terminalInstanceRef.current;
    /* v8 ignore start */
    if (!terminal) {
      return;
    }
    /* v8 ignore stop */
    terminal.options.fontSize = fontSize;
    fitAddonRef.current?.fit();
  }, [fontSize]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-black"
      data-testid="terminal-container"
    />
  );
});

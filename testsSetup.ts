// Configure React's act() for the test environment FIRST before any imports
// This must be at the very top to ensure React sees it when it loads
// @ts-expect-error - Setting React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill pointer capture methods for Base UI components in jsdom
if (typeof Element.prototype.hasPointerCapture === 'undefined') {
  Element.prototype.hasPointerCapture = () => false;
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill for jsdom
  Element.prototype.setPointerCapture = () => {};
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill for jsdom
  Element.prototype.releasePointerCapture = () => {};
}

// Polyfill scrollIntoView for jsdom (used by Base UI Select)
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill for jsdom
  Element.prototype.scrollIntoView = () => {};
}

// Polyfill getAnimations for jsdom (used by Base UI ScrollArea and transitions)
if (typeof Element.prototype.getAnimations === 'undefined') {
  Element.prototype.getAnimations = () => [];
}
if (typeof Document.prototype.getAnimations === 'undefined') {
  Document.prototype.getAnimations = () => [];
}

// Polyfill CSSTransition for jsdom (Base UI uses CSS transitions for open/close)
if (typeof HTMLElement.prototype.getAnimations === 'undefined') {
  HTMLElement.prototype.getAnimations = () => [];
}

// Polyfill matchMedia for jsdom (used by floating-ui)
if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
      addListener: () => {},
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
      removeListener: () => {},
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
      addEventListener: () => {},
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Polyfill ClipboardEvent for jsdom
if (typeof window.ClipboardEvent === 'undefined') {
  window.ClipboardEvent = class ClipboardEvent extends Event {
    clipboardData: DataTransfer | null;
    constructor(type: string, eventInitDict?: ClipboardEventInit) {
      super(type, eventInitDict);
      this.clipboardData = eventInitDict?.clipboardData ?? null;
    }
  };
}

// Polyfill canvas getContext for jsdom (prevents "Not implemented" thrown error)
HTMLCanvasElement.prototype.getContext = (() => null) as never;

// Polyfill ResizeObserver for Base UI components
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
    observe() {}
    // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
    unobserve() {}
    // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Mock centrifuge SDK globally — prevents side effects in jsdom
vi.mock('centrifuge', () => {
  function MockSubscription() {
    return {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      removeAllListeners: vi.fn(),
      publish: vi.fn().mockResolvedValue({}),
      state: 'unsubscribed',
    };
  }
  function MockCentrifuge() {
    return {
      on: vi.fn().mockReturnThis(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      removeSubscription: vi.fn(),
      newSubscription: vi.fn().mockImplementation(() => MockSubscription()),
      state: 'disconnected',
    };
  }
  return { Centrifuge: MockCentrifuge };
});

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { configureLogHandler } from './src/lib/logger.utils';
import { MSWSuccessHandlers } from './src/lib/test.utils';

// Silence logs during tests to keep output clean
// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op to suppress test logs
configureLogHandler(() => {});

// Set up MSW server and start listening BEFORE any modules import the auth client
export const server = setupServer(...MSWSuccessHandlers());

// Start MSW immediately - this must happen before better-auth client is created
server.listen({
  onUnhandledRequest: (request) => {
    throw new Error(
      `No request handler found for ${request.method} ${request.url}`,
    );
  },
});

beforeAll(() => {
  // MSW is already listening
});

beforeEach(() => {
  // Ensure clean body state before each test (Base UI dialogs set overflow: hidden)
  document.body.removeAttribute('style');
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  // Reset body styles that Base UI dialogs may leave behind (overflow lock)
  document.body.removeAttribute('style');
  // Remove any leftover portals from Base UI floating elements
  for (const portal of document.querySelectorAll('[data-floating-ui-portal]')) {
    portal.remove();
  }
});

afterAll(() => server.close());

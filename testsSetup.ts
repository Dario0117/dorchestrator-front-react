// Configure React's act() for the test environment FIRST before any imports
// This must be at the very top to ensure React sees it when it loads
// @ts-expect-error - Setting React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill pointer capture methods for Radix UI components in jsdom
if (typeof Element.prototype.hasPointerCapture === 'undefined') {
  Element.prototype.hasPointerCapture = () => false;
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill for jsdom
  Element.prototype.setPointerCapture = () => {};
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill for jsdom
  Element.prototype.releasePointerCapture = () => {};
}

// Polyfill scrollIntoView for jsdom (used by Radix Select)
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop polyfill for jsdom
  Element.prototype.scrollIntoView = () => {};
}

// Polyfill ResizeObserver for Radix UI components
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

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { MSWSuccessHandlers } from './src/lib/test.utils';

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

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());

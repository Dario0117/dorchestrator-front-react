// Configure React's act() for the test environment FIRST before any imports
// This must be at the very top to ensure React sees it when it loads
// @ts-expect-error - Setting React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

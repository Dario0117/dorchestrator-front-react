// Tests for useTerminalSessionLifecycle are covered by terminal.page.test.tsx
// The hook is tightly coupled to TanStack Router (useNavigate) and the WebSocket client,
// making isolated hook testing impractical without mocking internal modules.

describe('useTerminalSessionLifecycle', () => {
  it.todo(
    'is tested through terminal.page — hook depends on useNavigate and terminalWsClient',
  );
});

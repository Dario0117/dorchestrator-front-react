// SharedSessionPage resolves a share token and renders one of three states:
// - Loading skeleton
// - Error state (410 Gone or generic error)
// - Active shared session with TerminalEmulator (read-only) + SuggestionSidebar
// The active state requires WebSocket (terminalWsClient) making it difficult to
// test without mocking internal modules. Child components tested separately:
// - TerminalEmulator, TerminalConnectionStatus, FontSizeControls, SuggestionSidebar

describe('SharedSessionPage', () => {
  it.todo('re-evaluate when share link resolution logic becomes more complex');
});

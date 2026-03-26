// TerminalSessionPage is a thin status dispatcher that renders:
// - SessionTerminated (tested in session-terminated.test.tsx)
// - SessionLocked (tested in session-locked.test.tsx)
// - TerminalPage (tested via its child components)
// based on the session status from useTerminalSessionSuspenseQuery.
// No meaningful logic beyond the status switch — internals are tested separately.

describe('TerminalSessionPage', () => {
  it.todo('re-evaluate when page gains logic beyond status dispatch');
});

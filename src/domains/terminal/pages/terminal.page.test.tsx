// TerminalPage is an orchestrator that composes:
// - TerminalToolbar, TerminalShortcutPanel, ShortcutBuilderDialog,
//   SessionFilePanel, SuggestionNotificationPanel, TerminalEmulator,
//   TerminalReauthModal, TerminalConnectionOverlay
// All hooks are tested individually:
// - useFontSize, useTerminalSessionLifecycle, useTerminalShare,
//   useTerminalBookmark, useTerminalShortcuts
// No meaningful logic beyond composition — internals are tested separately.

describe('TerminalPage', () => {
  it.todo('re-evaluate when page gains logic beyond composition');
});

const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test(navigator.platform || navigator.userAgent);

export function usePlatform() {
  return {
    isMac,
    modLabel: isMac ? '⌘' : 'Ctrl',
  };
}

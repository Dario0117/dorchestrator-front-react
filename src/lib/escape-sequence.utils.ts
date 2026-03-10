/**
 * Converts a string containing escape notation (e.g. `\x03`, `\n`, `\t`)
 * into a string with the actual control characters.
 *
 * This is needed because shortcut key sequences are stored as human-readable
 * escape notation (e.g. the user types `\x03` as 4 literal characters),
 * but the terminal expects the real byte (0x03 for Ctrl+C).
 */
export function parseEscapeSequence(input: string): string {
  return input.replace(
    /\\(x[0-9a-fA-F]{2}|n|t|r|\\)/g,
    (_match, capture: string) => {
      switch (capture) {
        case 'n':
          return '\n';
        case 't':
          return '\t';
        case 'r':
          return '\r';
        case '\\':
          return '\\';
        default:
          return String.fromCharCode(Number.parseInt(capture.slice(1), 16));
      }
    },
  );
}

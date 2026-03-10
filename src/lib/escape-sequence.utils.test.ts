import { parseEscapeSequence } from '@lib/escape-sequence.utils';

describe('parseEscapeSequence', () => {
  test('converts \\n to newline', () => {
    expect(parseEscapeSequence('ls -la\\n')).toBe('ls -la\n');
  });

  test('converts \\t to tab', () => {
    expect(parseEscapeSequence('\\t')).toBe('\t');
  });

  test('converts \\r to carriage return', () => {
    expect(parseEscapeSequence('\\r')).toBe('\r');
  });

  test('converts \\x03 to Ctrl+C (0x03)', () => {
    expect(parseEscapeSequence('\\x03')).toBe('\x03');
  });

  test('converts \\x04 to Ctrl+D (0x04)', () => {
    expect(parseEscapeSequence('\\x04')).toBe('\x04');
  });

  test('converts \\x1a to Ctrl+Z (0x1a)', () => {
    expect(parseEscapeSequence('\\x1a')).toBe('\x1a');
  });

  test('converts \\x0c to Ctrl+L (0x0c)', () => {
    expect(parseEscapeSequence('\\x0c')).toBe('\x0c');
  });

  test('converts \\x1b to Escape (0x1b)', () => {
    expect(parseEscapeSequence('\\x1b')).toBe('\x1b');
  });

  test('converts ANSI arrow sequence \\x1b[A', () => {
    expect(parseEscapeSequence('\\x1b[A')).toBe('\x1b[A');
  });

  test('converts escaped backslash \\\\ to single backslash', () => {
    expect(parseEscapeSequence('\\\\')).toBe('\\');
  });

  test('handles multiple escape sequences in one string', () => {
    expect(parseEscapeSequence('echo hello\\necho world\\n')).toBe(
      'echo hello\necho world\n',
    );
  });

  test('passes plain text through unchanged', () => {
    expect(parseEscapeSequence('docker ps')).toBe('docker ps');
  });

  test('handles uppercase hex digits', () => {
    expect(parseEscapeSequence('\\x1B')).toBe('\x1b');
  });

  test('handles empty string', () => {
    expect(parseEscapeSequence('')).toBe('');
  });
});

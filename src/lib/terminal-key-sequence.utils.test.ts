import {
  buildKeyLabel,
  buildKeySequence,
  type Modifiers,
} from '@lib/terminal-key-sequence.utils';

const NONE: Modifiers = { ctrl: false, shift: false, alt: false };
const CTRL: Modifiers = { ctrl: true, shift: false, alt: false };
const SHIFT: Modifiers = { ctrl: false, shift: true, alt: false };
const ALT: Modifiers = { ctrl: false, shift: false, alt: true };
const CTRL_SHIFT: Modifiers = { ctrl: true, shift: true, alt: false };
const CTRL_ALT: Modifiers = { ctrl: true, shift: false, alt: true };
const ALT_SHIFT: Modifiers = { ctrl: false, shift: true, alt: true };

describe('buildKeySequence', () => {
  describe('letters without modifiers', () => {
    test('plain letter returns lowercase', () => {
      expect(buildKeySequence('A', NONE)).toBe('a');
      expect(buildKeySequence('z', NONE)).toBe('z');
    });
  });

  describe('Ctrl+letter', () => {
    test('Ctrl+A = \\x01', () => {
      expect(buildKeySequence('A', CTRL)).toBe('\\x01');
    });

    test('Ctrl+C = \\x03', () => {
      expect(buildKeySequence('C', CTRL)).toBe('\\x03');
    });

    test('Ctrl+O = \\x0f', () => {
      expect(buildKeySequence('O', CTRL)).toBe('\\x0f');
    });

    test('Ctrl+Z = \\x1a', () => {
      expect(buildKeySequence('Z', CTRL)).toBe('\\x1a');
    });
  });

  describe('Shift+letter', () => {
    test('Shift+A = uppercase A', () => {
      expect(buildKeySequence('A', SHIFT)).toBe('A');
    });
  });

  describe('Alt+letter', () => {
    test('Alt+A = \\x1ba', () => {
      expect(buildKeySequence('A', ALT)).toBe('\\x1ba');
    });
  });

  describe('Ctrl+Alt+letter', () => {
    test('Ctrl+Alt+A = \\x1b\\x01', () => {
      expect(buildKeySequence('A', CTRL_ALT)).toBe('\\x1b\\x01');
    });
  });

  describe('Ctrl+Shift+letter', () => {
    test('Ctrl+Shift+A = \\x01 (same as Ctrl+A in most terminals)', () => {
      expect(buildKeySequence('A', CTRL_SHIFT)).toBe('\\x01');
    });
  });

  describe('Alt+Shift+letter', () => {
    test('Alt+Shift+A = \\x1bA (uppercase)', () => {
      expect(buildKeySequence('A', ALT_SHIFT)).toBe('\\x1bA');
    });
  });

  describe('special keys without modifiers', () => {
    test('Tab = \\t', () => {
      expect(buildKeySequence('Tab', NONE)).toBe('\\t');
    });

    test('Enter = \\n', () => {
      expect(buildKeySequence('Enter', NONE)).toBe('\\n');
    });

    test('Esc = \\x1b', () => {
      expect(buildKeySequence('Esc', NONE)).toBe('\\x1b');
    });

    test('Space', () => {
      expect(buildKeySequence('Space', NONE)).toBe(' ');
    });

    test('Backspace = \\x7f', () => {
      expect(buildKeySequence('Backspace', NONE)).toBe('\\x7f');
    });

    test('Delete = \\x1b[3~', () => {
      expect(buildKeySequence('Delete', NONE)).toBe('\\x1b[3~');
    });
  });

  describe('arrow keys without modifiers', () => {
    test('Up = \\x1b[A', () => {
      expect(buildKeySequence('Up', NONE)).toBe('\\x1b[A');
    });

    test('Down = \\x1b[B', () => {
      expect(buildKeySequence('Down', NONE)).toBe('\\x1b[B');
    });

    test('Right = \\x1b[C', () => {
      expect(buildKeySequence('Right', NONE)).toBe('\\x1b[C');
    });

    test('Left = \\x1b[D', () => {
      expect(buildKeySequence('Left', NONE)).toBe('\\x1b[D');
    });
  });

  describe('arrow keys with modifiers', () => {
    test('Shift+Up = \\x1b[1;2A', () => {
      expect(buildKeySequence('Up', SHIFT)).toBe('\\x1b[1;2A');
    });

    test('Ctrl+Up = \\x1b[1;5A', () => {
      expect(buildKeySequence('Up', CTRL)).toBe('\\x1b[1;5A');
    });

    test('Ctrl+Shift+Right = \\x1b[1;6C', () => {
      expect(buildKeySequence('Right', CTRL_SHIFT)).toBe('\\x1b[1;6C');
    });

    test('Alt+Left = \\x1b[1;3D', () => {
      expect(buildKeySequence('Left', ALT)).toBe('\\x1b[1;3D');
    });
  });

  describe('function keys', () => {
    test('F1 = \\x1bOP', () => {
      expect(buildKeySequence('F1', NONE)).toBe('\\x1bOP');
    });

    test('F5 = \\x1b[15~', () => {
      expect(buildKeySequence('F5', NONE)).toBe('\\x1b[15~');
    });

    test('Ctrl+F1 = \\x1b[1;5P', () => {
      expect(buildKeySequence('F1', CTRL)).toBe('\\x1b[1;5P');
    });

    test('Shift+F5 = \\x1b[15;2~', () => {
      expect(buildKeySequence('F5', SHIFT)).toBe('\\x1b[15;2~');
    });
  });

  describe('Shift+Tab', () => {
    test('Shift+Tab = \\x1b[Z', () => {
      expect(buildKeySequence('Tab', SHIFT)).toBe('\\x1b[Z');
    });
  });

  describe('navigation keys with modifiers', () => {
    test('Ctrl+Home = \\x1b[1;5H', () => {
      expect(buildKeySequence('Home', CTRL)).toBe('\\x1b[1;5H');
    });

    test('Shift+Delete = \\x1b[3;2~', () => {
      expect(buildKeySequence('Delete', SHIFT)).toBe('\\x1b[3;2~');
    });

    test('Ctrl+PageUp = \\x1b[5;5~', () => {
      expect(buildKeySequence('PageUp', CTRL)).toBe('\\x1b[5;5~');
    });
  });

  describe('Ctrl+Space', () => {
    test('Ctrl+Space = \\x00', () => {
      expect(buildKeySequence('Space', CTRL)).toBe('\\x00');
    });
  });
});

describe('buildKeyLabel', () => {
  test('plain key', () => {
    expect(buildKeyLabel('a', NONE)).toBe('A');
  });

  test('Ctrl+C', () => {
    expect(buildKeyLabel('C', CTRL)).toBe('Ctrl+C');
  });

  test('Ctrl+Shift+Up', () => {
    expect(buildKeyLabel('Up', CTRL_SHIFT)).toBe('Ctrl+Shift+Up');
  });

  test('Alt+F1', () => {
    expect(buildKeyLabel('F1', ALT)).toBe('Alt+F1');
  });

  test('Shift+Tab', () => {
    expect(buildKeyLabel('Tab', SHIFT)).toBe('Shift+Tab');
  });
});

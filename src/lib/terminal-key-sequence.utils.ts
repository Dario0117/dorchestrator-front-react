/**
 * Generates terminal escape sequences for any modifier+key combination.
 *
 * Modifier encoding (CSI parameter):
 *   2=Shift, 3=Alt, 4=Shift+Alt, 5=Ctrl, 6=Ctrl+Shift, 7=Ctrl+Alt, 8=Ctrl+Shift+Alt
 *
 * Reference: xterm CSI sequences and VT100/VT220 key codes.
 */

export interface Modifiers {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

export type KeyCategory =
  | 'letters'
  | 'common'
  | 'arrows'
  | 'navigation'
  | 'function';

interface KeyDefinition {
  label: string;
  key: string;
  category: KeyCategory;
}

// CSI modifier parameter: 1 + bitmask (Shift=1, Alt=2, Ctrl=4)
function modifierParam(mods: Modifiers): number {
  let param = 1;
  if (mods.shift) {
    param += 1;
  }
  if (mods.alt) {
    param += 2;
  }
  if (mods.ctrl) {
    param += 4;
  }
  return param;
}

function hasModifier(mods: Modifiers): boolean {
  return mods.ctrl || mods.shift || mods.alt;
}

// Plain special key sequences (no modifiers)
const PLAIN_SEQUENCES: Record<string, string> = {
  Tab: '\\t',
  Enter: '\\n',
  Esc: '\\x1b',
  Space: ' ',
  Backspace: '\\x7f',
  Delete: '\\x1b[3~',
  Insert: '\\x1b[2~',
  Up: '\\x1b[A',
  Down: '\\x1b[B',
  Right: '\\x1b[C',
  Left: '\\x1b[D',
  Home: '\\x1b[H',
  End: '\\x1b[F',
  PageUp: '\\x1b[5~',
  PageDown: '\\x1b[6~',
  F1: '\\x1bOP',
  F2: '\\x1bOQ',
  F3: '\\x1bOR',
  F4: '\\x1bOS',
  F5: '\\x1b[15~',
  F6: '\\x1b[17~',
  F7: '\\x1b[18~',
  F8: '\\x1b[19~',
  F9: '\\x1b[20~',
  F10: '\\x1b[21~',
  F11: '\\x1b[23~',
  F12: '\\x1b[24~',
};

// Arrow/Home/End keys use SS3 or CSI single-letter format
const CSI_LETTER_KEYS: Record<string, string> = {
  Up: 'A',
  Down: 'B',
  Right: 'C',
  Left: 'D',
  Home: 'H',
  End: 'F',
};

// F1-F4 use SS3 format with modifiers: \x1b[1;<mod>P/Q/R/S
const F1_F4_LETTERS: Record<string, string> = {
  F1: 'P',
  F2: 'Q',
  F3: 'R',
  F4: 'S',
};

// F5-F12, Delete, Insert, PageUp, PageDown use tilde format: \x1b[<num>;<mod>~
const TILDE_KEYS: Record<string, number> = {
  Insert: 2,
  Delete: 3,
  PageUp: 5,
  PageDown: 6,
  F5: 15,
  F6: 17,
  F7: 18,
  F8: 19,
  F9: 20,
  F10: 21,
  F11: 23,
  F12: 24,
};

function ctrlLetterCode(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0) - 64;
  return `\\x${code.toString(16).padStart(2, '0')}`;
}

/**
 * Generates the terminal escape sequence for a key + modifier combination.
 */
export function buildKeySequence(key: string, mods: Modifiers): string {
  const noMods = !hasModifier(mods);

  // Single letter keys
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    if (noMods) {
      return key.toLowerCase();
    }
    if (mods.ctrl && !mods.shift && !mods.alt) {
      return ctrlLetterCode(key);
    }
    if (mods.alt && !mods.ctrl && !mods.shift) {
      return `\\x1b${key.toLowerCase()}`;
    }
    if (mods.ctrl && mods.alt && !mods.shift) {
      return `\\x1b${ctrlLetterCode(key)}`;
    }
    // Shift+letter = uppercase
    if (mods.shift && !mods.ctrl && !mods.alt) {
      return key.toUpperCase();
    }
    // Ctrl+Shift+letter = same as Ctrl+letter in most terminals
    if (mods.ctrl && mods.shift && !mods.alt) {
      return ctrlLetterCode(key);
    }
    // Alt+Shift+letter
    if (mods.alt && mods.shift && !mods.ctrl) {
      return `\\x1b${key.toUpperCase()}`;
    }
    // Ctrl+Alt+Shift+letter
    return `\\x1b${ctrlLetterCode(key)}`;
  }

  // Special case: Shift+Tab
  if (key === 'Tab' && mods.shift && !mods.ctrl && !mods.alt) {
    return '\\x1b[Z';
  }

  // Ctrl+letter-like keys (Tab=\x09=Ctrl+I, Enter=\x0d=Ctrl+M, etc.) with Ctrl only
  if (key === 'Space' && mods.ctrl && !mods.shift && !mods.alt) {
    return '\\x00';
  }

  // No modifiers: use plain sequences
  if (noMods) {
    return PLAIN_SEQUENCES[key] ?? key;
  }

  const mod = modifierParam(mods);

  // CSI letter keys (arrows, Home, End): \x1b[1;<mod><letter>
  if (key in CSI_LETTER_KEYS) {
    return `\\x1b[1;${mod}${CSI_LETTER_KEYS[key]}`;
  }

  // F1-F4: \x1b[1;<mod><letter>
  if (key in F1_F4_LETTERS) {
    return `\\x1b[1;${mod}${F1_F4_LETTERS[key]}`;
  }

  // Tilde keys: \x1b[<num>;<mod>~
  if (key in TILDE_KEYS) {
    return `\\x1b[${TILDE_KEYS[key]};${mod}~`;
  }

  // Tab with Ctrl (and possibly other modifiers): \x1b[27;<mod>;9~
  if (key === 'Tab') {
    return `\\x1b[27;${mod};9~`;
  }

  // Fallback for other special keys with modifiers
  const plain = PLAIN_SEQUENCES[key];
  if (plain) {
    return plain;
  }

  return key;
}

/**
 * Builds a human-readable label for a key + modifier combination.
 */
export function buildKeyLabel(key: string, mods: Modifiers): string {
  const parts: string[] = [];
  if (mods.ctrl) {
    parts.push('Ctrl');
  }
  if (mods.shift) {
    parts.push('Shift');
  }
  if (mods.alt) {
    parts.push('Alt');
  }
  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join('+');
}

export const KEY_DEFINITIONS: KeyDefinition[] = [
  // Letters
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .map((l) => ({ label: l, key: l, category: 'letters' as const })),

  // Common
  { label: 'Tab', key: 'Tab', category: 'common' },
  { label: 'Enter', key: 'Enter', category: 'common' },
  { label: 'Esc', key: 'Esc', category: 'common' },
  { label: 'Space', key: 'Space', category: 'common' },
  { label: 'Backspace', key: 'Backspace', category: 'common' },
  { label: 'Delete', key: 'Delete', category: 'common' },

  // Arrows
  { label: '↑', key: 'Up', category: 'arrows' },
  { label: '↓', key: 'Down', category: 'arrows' },
  { label: '←', key: 'Left', category: 'arrows' },
  { label: '→', key: 'Right', category: 'arrows' },

  // Navigation
  { label: 'Home', key: 'Home', category: 'navigation' },
  { label: 'End', key: 'End', category: 'navigation' },
  { label: 'PgUp', key: 'PageUp', category: 'navigation' },
  { label: 'PgDn', key: 'PageDown', category: 'navigation' },
  { label: 'Insert', key: 'Insert', category: 'navigation' },

  // Function keys
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `F${i + 1}`,
    key: `F${i + 1}`,
    category: 'function' as const,
  })),
];

export const KEY_CATEGORIES: { id: KeyCategory; label: string }[] = [
  { id: 'letters', label: 'Letters' },
  { id: 'common', label: 'Common' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'function', label: 'Function' },
];

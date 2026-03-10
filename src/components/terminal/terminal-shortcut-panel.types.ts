export interface ShortcutDefinition {
  label: string;
  sequence: string;
  ariaLabel: string;
}

export const SHORTCUT_MODES = ['keystroke', 'snippet'] as const;
export type ShortcutMode = (typeof SHORTCUT_MODES)[number];

export interface CustomShortcut {
  id: number;
  label: string;
  keySequence: string;
  mode: ShortcutMode;
  color: string | null;
  sortOrder: number;
}

export interface TerminalShortcutPanelProps {
  onShortcutPress: (sequence: string) => void;
  onCustomShortcutPress: (shortcut: CustomShortcut) => void;
  customShortcuts: CustomShortcut[];
  onAddShortcut: () => void;
  onEditShortcut: (shortcut: CustomShortcut) => void;
  onDeleteShortcut: (shortcutId: number) => void;
}

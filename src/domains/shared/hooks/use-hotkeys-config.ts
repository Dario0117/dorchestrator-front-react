import { useHotkey } from '@tanstack/react-hotkeys';

interface HotkeyActions {
  onCommandPalette: () => void;
  onFilter?: () => void;
  onNew?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export function useHotkeysConfig(actions: HotkeyActions) {
  useHotkey('Mod+K', (e) => {
    e.preventDefault();
    actions.onCommandPalette();
  });

  useHotkey(
    'F',
    () => {
      actions.onFilter?.();
    },
    { enabled: !!actions.onFilter },
  );

  useHotkey(
    'N',
    () => {
      actions.onNew?.();
    },
    { enabled: !!actions.onNew },
  );

  useHotkey(
    '/',
    () => {
      actions.onSearch?.();
    },
    { enabled: !!actions.onSearch },
  );

  useHotkey(
    'Escape',
    () => {
      actions.onEscape?.();
    },
    { enabled: !!actions.onEscape },
  );
}

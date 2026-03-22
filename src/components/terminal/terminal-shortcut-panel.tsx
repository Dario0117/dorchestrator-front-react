import { Button } from '@components/ds/atoms/button';
import { Separator } from '@components/ds/atoms/separator';
import { CustomShortcutButton } from '@components/terminal/custom-shortcut-button';
import type {
  ShortcutDefinition,
  TerminalShortcutPanelProps,
} from '@components/terminal/terminal-shortcut-panel.types';
import { Plus } from 'lucide-react';

const PRESET_SHORTCUTS: ShortcutDefinition[] = [
  { label: 'Ctrl+C', sequence: '\x03', ariaLabel: 'Send interrupt signal' },
  { label: 'Ctrl+D', sequence: '\x04', ariaLabel: 'Send end of file' },
  { label: 'Ctrl+Z', sequence: '\x1a', ariaLabel: 'Suspend process' },
  { label: 'Ctrl+L', sequence: '\x0c', ariaLabel: 'Clear terminal screen' },
  { label: 'Tab', sequence: '\t', ariaLabel: 'Tab completion' },
  { label: 'Esc', sequence: '\x1b', ariaLabel: 'Escape key' },
  { label: '\u2191', sequence: '\x1b[A', ariaLabel: 'Previous command' },
  { label: '\u2193', sequence: '\x1b[B', ariaLabel: 'Next command' },
];

export function TerminalShortcutPanel({
  onShortcutPress,
  onCustomShortcutPress,
  customShortcuts,
  onAddShortcut,
  onEditShortcut,
  onDeleteShortcut,
}: TerminalShortcutPanelProps) {
  const hasCustomShortcuts = customShortcuts.length > 0;

  return (
    <div
      className="flex flex-nowrap gap-2 overflow-x-auto bg-muted/50 p-2 md:flex-wrap md:gap-1 md:overflow-visible md:p-1.5"
      role="toolbar"
      aria-label="Terminal shortcuts"
      data-testid="shortcut-panel"
    >
      {PRESET_SHORTCUTS.map((shortcut) => (
        <Button
          key={shortcut.label}
          variant="outline"
          size="sm"
          className="min-w-11 shrink-0 text-base md:h-9 md:min-h-9 md:min-w-9 md:px-2 md:text-sm"
          aria-label={shortcut.ariaLabel}
          data-testid={`shortcut-btn-${shortcut.label}`}
          onClick={() => onShortcutPress(shortcut.sequence)}
        >
          {shortcut.label}
        </Button>
      ))}

      {hasCustomShortcuts && (
        <>
          <Separator
            orientation="vertical"
            className="mx-1 h-auto self-stretch"
          />
          {customShortcuts.map((shortcut) => (
            <CustomShortcutButton
              key={shortcut.id}
              shortcut={shortcut}
              onPress={onCustomShortcutPress}
              onEdit={onEditShortcut}
              onDelete={onDeleteShortcut}
            />
          ))}
        </>
      )}

      {!hasCustomShortcuts && (
        <Separator
          orientation="vertical"
          className="mx-1 h-auto self-stretch"
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        className="min-w-11 shrink-0 text-base text-muted-foreground md:h-9 md:min-h-9 md:min-w-9 md:px-2 md:text-sm"
        aria-label="Add custom shortcut"
        data-testid="add-shortcut-btn"
        onClick={onAddShortcut}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add
      </Button>
    </div>
  );
}

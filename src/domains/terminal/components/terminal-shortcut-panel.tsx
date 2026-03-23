import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { Separator } from '@components/ds/atoms/separator';
import { CustomShortcutButton } from '@domains/terminal/components/custom-shortcut-button';
import type {
  ShortcutDefinition,
  TerminalShortcutPanelProps,
} from '@domains/terminal/components/terminal-shortcut-panel.types';
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
    <HStack
      gap="sm"
      align="stretch"
      shrink={false}
      border="bottom"
      overflowX="auto"
      bg="muted/50"
      innerSpaceX="sm"
      innerSpaceY="sm"
      role="toolbar"
      aria-label="Terminal shortcuts"
      data-testid="shortcut-panel"
    >
      {PRESET_SHORTCUTS.map((shortcut) => (
        <Button
          key={shortcut.label}
          variant="outline"
          size="toolbar"
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
            stretch
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
          stretch
        />
      )}
      <Button
        variant="ghost"
        size="toolbar"
        aria-label="Add custom shortcut"
        data-testid="add-shortcut-btn"
        onClick={onAddShortcut}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add
      </Button>
    </HStack>
  );
}

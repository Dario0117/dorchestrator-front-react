import type {
  CustomShortcut,
  ShortcutDefinition,
  TerminalShortcutPanelProps,
} from '@components/terminal/terminal-shortcut-panel.types';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Separator } from '@components/ui/separator';
import { MoreVertical, Pencil, Plus, Send, Trash2, Zap } from 'lucide-react';

const PRESET_SHORTCUTS: ShortcutDefinition[] = [
  { label: 'Ctrl+C', sequence: '\x03', ariaLabel: 'Send interrupt signal' },
  { label: 'Ctrl+D', sequence: '\x04', ariaLabel: 'Send end of file' },
  { label: 'Ctrl+Z', sequence: '\x1a', ariaLabel: 'Suspend process' },
  { label: 'Ctrl+L', sequence: '\x0c', ariaLabel: 'Clear terminal screen' },
  { label: 'Tab', sequence: '\t', ariaLabel: 'Tab completion' },
  { label: 'Esc', sequence: '\x1b', ariaLabel: 'Escape key' },
  { label: '↑', sequence: '\x1b[A', ariaLabel: 'Previous command' },
  { label: '↓', sequence: '\x1b[B', ariaLabel: 'Next command' },
];

function CustomShortcutButton({
  shortcut,
  onPress,
  onEdit,
  onDelete,
}: {
  shortcut: CustomShortcut;
  onPress: (shortcut: CustomShortcut) => void;
  onEdit: (shortcut: CustomShortcut) => void;
  onDelete: (shortcutId: number) => void;
}) {
  return (
    <div className="group relative shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="min-w-11 shrink-0 text-base md:h-9 md:min-h-9 md:min-w-9 md:px-2 md:text-sm"
        style={
          shortcut.color
            ? { borderColor: shortcut.color, color: shortcut.color }
            : undefined
        }
        aria-label={`${shortcut.mode === 'snippet' ? 'Suggest' : 'Run'} shortcut: ${shortcut.label}`}
        data-testid={`custom-shortcut-btn-${shortcut.id}`}
        onClick={() => onPress(shortcut)}
      >
        {shortcut.mode === 'snippet' ? (
          <Send className="mr-1 h-3 w-3 opacity-60" />
        ) : (
          <Zap className="mr-1 h-3 w-3 opacity-60" />
        )}
        {shortcut.label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100"
            aria-label={`Options for ${shortcut.label}`}
            data-testid={`custom-shortcut-menu-${shortcut.id}`}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(shortcut)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(shortcut.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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

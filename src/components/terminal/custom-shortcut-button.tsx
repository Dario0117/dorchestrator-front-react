import type { CustomShortcut } from '@components/terminal/terminal-shortcut-panel.types';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { MoreVertical, Pencil, Send, Trash2, Zap } from 'lucide-react';

export function CustomShortcutButton({
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
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100"
              aria-label={`Options for ${shortcut.label}`}
              data-testid={`custom-shortcut-menu-${shortcut.id}`}
            />
          }
        >
          <MoreVertical className="h-3 w-3" />
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

import { Button } from '@components/ds/atoms/button';
import { Positioned } from '@components/ds/atoms/positioned';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ds/molecules/dropdown-menu';
import type { CustomShortcut } from '@domains/terminal/components/terminal-shortcut-panel.types';
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
    <Positioned
      shrink={false}
      position="relative"
      group
    >
      <Button
        variant="outline"
        size="toolbar"
        accentColor={shortcut.color || undefined}
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
        <Positioned
          position="absolute"
          insetTopRight
          showOnGroupHover
        >
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                rounded
                aria-label={`Options for ${shortcut.label}`}
                data-testid={`custom-shortcut-menu-${shortcut.id}`}
              />
            }
          >
            <MoreVertical className="h-3 w-3" />
          </DropdownMenuTrigger>
        </Positioned>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(shortcut)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            color="destructive"
            onClick={() => onDelete(shortcut.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Positioned>
  );
}

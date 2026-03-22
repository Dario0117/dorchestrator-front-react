import { Button } from '@components/ds/atoms/button';
import { Input } from '@components/ds/atoms/input';
import type { BookmarkItem } from '@services/terminal/list-bookmarks.http-service';
import { useUpdateBookmarkNoteMutation } from '@services/terminal/update-bookmark-note.http-service';
import { Pencil, X } from 'lucide-react';
import { useState } from 'react';

export function InlineNoteEditor({
  bookmark,
  organizationId,
}: {
  bookmark: BookmarkItem;
  organizationId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(bookmark.note ?? '');
  const updateMutation = useUpdateBookmarkNoteMutation();

  const handleSave = () => {
    updateMutation.mutate(
      {
        params: {
          path: { organizationId, bookmarkId: bookmark.id },
        },
        body: { note: noteValue || null },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          className="h-7 w-48 text-xs"
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            }
            if (e.key === 'Escape') {
              setIsEditing(false);
              setNoteValue(bookmark.note ?? '');
            }
          }}
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1"
          onClick={() => {
            setIsEditing(false);
            setNoteValue(bookmark.note ?? '');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="flex items-center gap-1 text-left text-xs text-muted-foreground hover:text-foreground"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {bookmark.note ? (
        <span className="max-w-[200px] truncate">{bookmark.note}</span>
      ) : (
        <span className="italic">Add note...</span>
      )}
      <Pencil className="h-3 w-3 shrink-0" />
    </button>
  );
}

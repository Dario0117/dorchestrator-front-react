import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { Input } from '@components/ds/atoms/input';
import { SmallText } from '@components/ds/atoms/small-text';
import type { BookmarkItem } from '@domains/terminal/services/list-bookmarks.http-service';
import { useUpdateBookmarkNoteMutation } from '@domains/terminal/services/update-bookmark-note.http-service';
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
      <HStack gap="xs">
        <Input
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          inputSize="sm"
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
          size="xs"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            setIsEditing(false);
            setNoteValue(bookmark.note ?? '');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </HStack>
    );
  }

  return (
    <Button
      variant="ghost"
      size="inline"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {bookmark.note ? (
        <SmallText
          color="muted"
          truncate
          maxWidth="sm"
        >
          {bookmark.note}
        </SmallText>
      ) : (
        <SmallText
          color="muted"
          italic
        >
          Add note...
        </SmallText>
      )}
      <Pencil className="h-3 w-3 shrink-0" />
    </Button>
  );
}

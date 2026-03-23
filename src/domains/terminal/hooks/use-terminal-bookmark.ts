import { useCreateBookmarkMutation } from '@domains/terminal/services/create-bookmark.http-service';
import { useDeleteBookmarkMutation } from '@domains/terminal/services/delete-bookmark.http-service';
import { useCallback, useState } from 'react';

export function useTerminalBookmark({
  organizationId,
  sessionId,
}: {
  organizationId: string;
  sessionId: number;
}) {
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const createBookmarkMutation = useCreateBookmarkMutation();
  const deleteBookmarkMutation = useDeleteBookmarkMutation();

  const handleToggleBookmark = useCallback(() => {
    if (bookmarkId !== null) {
      deleteBookmarkMutation.mutate(
        {
          params: {
            path: { organizationId, bookmarkId },
          },
        },
        {
          onSuccess: () => setBookmarkId(null),
        },
      );
    } else {
      createBookmarkMutation.mutate(
        {
          params: {
            path: { organizationId },
          },
          body: { sessionId },
        },
        {
          onSuccess: (data) => {
            const id = data.responseData.results.id;
            setBookmarkId(id);
          },
        },
      );
    }
  }, [
    bookmarkId,
    organizationId,
    sessionId,
    createBookmarkMutation,
    deleteBookmarkMutation,
  ]);

  return {
    bookmarkId,
    isBookmarkPending:
      createBookmarkMutation.isPending || deleteBookmarkMutation.isPending,
    handleToggleBookmark,
  };
}

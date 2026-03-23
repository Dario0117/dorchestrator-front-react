import { Button } from '@components/ds/atoms/button';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { BookmarkStatusBadge } from '@domains/terminal/components/bookmark-status-badge';
import { InlineNoteEditor } from '@domains/terminal/components/inline-note-editor';
import type { BookmarkItem } from '@domains/terminal/services/list-bookmarks.http-service';
import { formatBytes } from '@lib/format-bytes';
import { formatRelativeTime } from '@lib/format-relative-time';
import { Trash2 } from 'lucide-react';

interface BookmarksTableProps {
  bookmarks: BookmarkItem[];
  organizationId: string;
  onRowClick: (sessionId: number) => void;
  onDelete: (bookmarkId: number, e: React.MouseEvent) => void;
  isDeletePending: boolean;
}

export function BookmarksTable({
  bookmarks,
  organizationId,
  onRowClick,
  onDelete,
  isDeletePending,
}: BookmarksTableProps) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Session Created</TableHead>
          <TableHead>Bookmarked</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Recording</TableHead>
          <TableHead className="w-[80px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookmarks.map((bookmark) => (
          <TableRow
            key={bookmark.id}
            className="cursor-pointer"
            onClick={() => onRowClick(bookmark.sessionId)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(bookmark.sessionId);
              }
            }}
          >
            <TableCell className="font-medium">{bookmark.deviceName}</TableCell>
            <TableCell>
              <BookmarkStatusBadge status={bookmark.sessionStatus} />
            </TableCell>
            <TableCell>
              {formatRelativeTime(bookmark.sessionCreatedAt)}
            </TableCell>
            <TableCell>{formatRelativeTime(bookmark.createdAt)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <InlineNoteEditor
                bookmark={bookmark}
                organizationId={organizationId}
              />
            </TableCell>
            <TableCell>
              {bookmark.recordingSizeBytes && bookmark.recordingSizeBytes > 0
                ? formatBytes(bookmark.recordingSizeBytes)
                : '—'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={(e) => onDelete(bookmark.id, e)}
                disabled={isDeletePending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

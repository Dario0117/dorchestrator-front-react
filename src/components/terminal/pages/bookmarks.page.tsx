import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { EmptyState } from '@components/ui/empty-state';
import { Input } from '@components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Skeleton } from '@components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { badgeStyles } from '@lib/badge-styles';
import { formatBytes } from '@lib/format-bytes';
import { formatRelativeTime } from '@lib/format-relative-time';
import { PAGE_SIZE_OPTIONS } from '@lib/pagination.constants';
import { Route } from '@routes/(authenticated)/$organizationSlug/terminal/bookmarks';
import { useDeleteBookmarkMutation } from '@services/terminal/delete-bookmark.http-service';
import type { BookmarkItem } from '@services/terminal/list-bookmarks.http-service';
import { useBookmarksSuspenseQuery } from '@services/terminal/list-bookmarks.http-service';
import { useUpdateBookmarkNoteMutation } from '@services/terminal/update-bookmark-note.http-service';
import { useNavigate } from '@tanstack/react-router';
import { Bookmark, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const STATUS_BADGE_STYLES: Record<string, string> = {
  active: badgeStyles.green,
  created: badgeStyles.blue,
  locked: badgeStyles.yellow,
  terminated: badgeStyles.gray,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={STATUS_BADGE_STYLES[status] ?? badgeStyles.gray}
    >
      {status}
    </Badge>
  );
}

function BookmarksTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
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
          {['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InlineNoteEditor({
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

function BookmarksPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const organizationId = currentOrganization.id;

  const { data } = useBookmarksSuspenseQuery(organizationId, { page, size });

  const deleteMutation = useDeleteBookmarkMutation();

  const bookmarks = data.responseData?.results ?? [];
  const totalResults = data.responseData?.totalResults ?? 0;
  const totalPages = data.responseData?.totalPages ?? 0;
  const hasNext = data.responseData?.hasNext ?? false;
  const hasPrevious = data.responseData?.hasPrevious ?? false;

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const handleSizeChange = (newSize: number) => {
    navigate({ search: (prev) => ({ ...prev, size: newSize, page: 1 }) });
  };

  const handleRowClick = (sessionId: number) => {
    navigate({
      to: '/$organizationSlug/terminal/$sessionId',
      params: {
        organizationSlug: currentOrganization.slug,
        sessionId: String(sessionId),
      },
    });
  };

  const handleDelete = (bookmarkId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate({
      params: {
        path: { organizationId, bookmarkId },
      },
    });
  };

  return (
    <section className="space-y-6 p-6 md:p-10">
      <div className="py-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="font-serif text-2xl font-bold">Bookmarked Sessions</h1>
        </div>

        {bookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarked sessions"
            description="Bookmark sessions from the terminal page to quickly access them later."
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
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
                      onClick={() => handleRowClick(bookmark.sessionId)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(bookmark.sessionId);
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {bookmark.deviceName}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bookmark.sessionStatus} />
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(bookmark.sessionCreatedAt)}
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(bookmark.createdAt)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <InlineNoteEditor
                          bookmark={bookmark}
                          organizationId={organizationId}
                        />
                      </TableCell>
                      <TableCell>
                        {bookmark.recordingSizeBytes &&
                        bookmark.recordingSizeBytes > 0
                          ? formatBytes(bookmark.recordingSizeBytes)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(bookmark.id, e)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <span className="text-sm text-muted-foreground">
                {totalResults} total{' '}
                {totalResults === 1 ? 'bookmark' : 'bookmarks'}
              </span>

              <div className="flex flex-col items-center gap-4 md:flex-row">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(page - 1)}
                        aria-disabled={!hasPrevious}
                        disabled={!hasPrevious}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <output className="px-2 text-sm">
                        Page {page} of {totalPages}
                      </output>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(page + 1)}
                        aria-disabled={!hasNext}
                        disabled={!hasNext}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <Select
                  value={String(size)}
                  onValueChange={(value) => handleSizeChange(Number(value))}
                >
                  <SelectTrigger
                    aria-label="Page size"
                    className="h-11 w-auto text-base md:text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={String(option)}
                      >
                        {option} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export { BookmarksPage, BookmarksTableSkeleton };

import { Button } from '@components/ds/atoms/button';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import { TableWrapper } from '@components/ds/atoms/table-wrapper';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { BookmarkStatusBadge } from '@components/terminal/pages/bookmark-status-badge';
import { InlineNoteEditor } from '@components/terminal/pages/inline-note-editor';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { formatBytes } from '@lib/format-bytes';
import { formatRelativeTime } from '@lib/format-relative-time';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/bookmarks';
import { useDeleteBookmarkMutation } from '@services/terminal/delete-bookmark.http-service';
import { useBookmarksSuspenseQuery } from '@services/terminal/list-bookmarks.http-service';
import { useNavigate } from '@tanstack/react-router';
import { Bookmark, Trash2 } from 'lucide-react';

function BookmarksPage() {
  const currentOrganization = useCurrentOrganization();
  const { page, size } = Route.useSearch();
  const { teamSlug } = Route.useParams();
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
      to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
      params: {
        organizationSlug: currentOrganization.slug,
        teamSlug,
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
    <PageSection>
      <div className="py-6">
        <PageHeadingBar>
          <SectionTitle>Bookmarked Sessions</SectionTitle>
        </PageHeadingBar>

        {bookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarked sessions"
            description="Bookmark sessions from the terminal page to quickly access them later."
          />
        ) : (
          <>
            <TableWrapper>
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
                        <BookmarkStatusBadge status={bookmark.sessionStatus} />
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
            </TableWrapper>

            <PaginatedFooter
              totalResults={totalResults}
              singularLabel="bookmark"
              pluralLabel="bookmarks"
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              size={size}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
            />
          </>
        )}
      </div>
    </PageSection>
  );
}

export { BookmarksPage };

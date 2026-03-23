import { Box } from '@components/ds/atoms/box';
import { EmptyState } from '@components/ds/atoms/empty-state';
import { PageSection } from '@components/ds/atoms/page-section';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { PageHeadingBar } from '@components/ds/molecules/page-heading-bar';
import { DataTable } from '@components/ds/organisms/data-table';
import { PaginatedFooter } from '@components/ds/organisms/paginated-footer';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useDeleteBookmarkMutation } from '@domains/terminal/services/delete-bookmark.http-service';
import { useBookmarksSuspenseQuery } from '@domains/terminal/services/list-bookmarks.http-service';
import { BookmarksTable } from '@domains/terminal/tables/bookmarks-table';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/bookmarks';
import { useNavigate } from '@tanstack/react-router';
import { Bookmark } from 'lucide-react';

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
      <Box innerSpaceY="lg">
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
            <DataTable>
              <BookmarksTable
                bookmarks={bookmarks}
                organizationId={organizationId}
                onRowClick={handleRowClick}
                onDelete={handleDelete}
                isDeletePending={deleteMutation.isPending}
              />
            </DataTable>

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
      </Box>
    </PageSection>
  );
}

export { BookmarksPage };

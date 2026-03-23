import { Box } from '@components/ds/atoms/box';
import { PageSection } from '@components/ds/atoms/page-section';
import { RouteErrorFallback } from '@components/ds/atoms/route-error-fallback';
import { SectionTitle } from '@components/ds/atoms/section-title';
import { BookmarksTableSkeleton } from '@domains/terminal/components/bookmarks-table-skeleton';
import { BookmarksPage } from '@domains/terminal/pages/bookmarks.page';
import { useBookmarksQueryOptions } from '@domains/terminal/services/list-bookmarks.http-service';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  size: z.coerce.number().int().positive().max(100).default(25).catch(25),
});

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/terminal/bookmarks',
)({
  validateSearch: searchParamsSchema,
  component: BookmarksRoute,
  errorComponent: ({ reset }) => (
    <RouteErrorFallback
      reset={reset}
      pageTitle="Bookmarked Sessions"
      errorTitle="Failed to load bookmarks"
      errorDescription="Something went wrong while loading your bookmarks."
    />
  ),
  loaderDeps: ({ search: { page, size } }) => ({ page, size }),
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useBookmarksQueryOptions(currentOrganization.id, {
        page: ctx.deps.page,
        size: ctx.deps.size,
      }),
    );
  },
});

function BookmarksRoute() {
  return (
    <Suspense
      fallback={
        <PageSection>
          <Box innerSpaceY="lg">
            <Box spaceBelow="lg">
              <SectionTitle>Bookmarked Sessions</SectionTitle>
            </Box>
            <BookmarksTableSkeleton />
          </Box>
        </PageSection>
      }
    >
      <BookmarksPage />
    </Suspense>
  );
}

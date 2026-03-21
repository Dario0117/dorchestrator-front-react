import { PageSection } from '@components/layout/page-section';
import { SectionTitle } from '@components/layout/section-title';
import { BookmarksPage } from '@components/terminal/pages/bookmarks.page';
import { BookmarksTableSkeleton } from '@components/terminal/pages/bookmarks-table-skeleton';
import { RouteErrorFallback } from '@components/ui/route-error-fallback';
import { useBookmarksQueryOptions } from '@services/terminal/list-bookmarks.http-service';
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
          <div className="py-6">
            <SectionTitle className="mb-6">Bookmarked Sessions</SectionTitle>
            <BookmarksTableSkeleton />
          </div>
        </PageSection>
      }
    >
      <BookmarksPage />
    </Suspense>
  );
}

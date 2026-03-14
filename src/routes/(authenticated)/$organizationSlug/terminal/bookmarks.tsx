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
  '/(authenticated)/$organizationSlug/terminal/bookmarks',
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
        <section className="space-y-6 p-6 md:p-10">
          <div className="py-6">
            <h1 className="mb-6 font-serif text-2xl font-bold">
              Bookmarked Sessions
            </h1>
            <BookmarksTableSkeleton />
          </div>
        </section>
      }
    >
      <BookmarksPage />
    </Suspense>
  );
}

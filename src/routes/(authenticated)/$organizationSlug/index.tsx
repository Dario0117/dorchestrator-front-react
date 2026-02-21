import { HomePage } from '@components/org/pages/home.page';
import { useOrganizationDetailsQueryOptions } from '@services/organizations/get-organization-details.http-service';
import { useOrganizationStatsQueryOptions } from '@services/organizations/get-organization-stats.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/$organizationSlug/')({
  component: HomePage,
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await Promise.all([
      ctx.context.queryClient.ensureQueryData(
        useOrganizationDetailsQueryOptions(currentOrganization.id),
      ),
      ctx.context.queryClient.ensureQueryData(
        useOrganizationStatsQueryOptions(currentOrganization.id),
      ),
    ]);
  },
});

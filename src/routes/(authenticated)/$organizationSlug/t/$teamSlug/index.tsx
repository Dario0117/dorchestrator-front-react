import { HomePage } from '@domains/org/pages/home.page';
import { useOrganizationDetailsQueryOptions } from '@domains/org/services/organizations/get-organization-details.http-service';
import { useOrganizationStatsQueryOptions } from '@domains/org/services/organizations/get-organization-stats.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/',
)({
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

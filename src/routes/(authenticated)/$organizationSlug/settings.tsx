import { OrganizationSettingsPage } from '@components/org/pages/organization-settings.page';
import { useOrganizationDetailsQueryOptions } from '@services/organizations/get-organization-details.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/settings',
)({
  component: OrganizationSettingsPage,
  loader: async (ctx) => {
    const currentOrganization = ctx.context.getCurrentOrganizationFromSlug(
      ctx.params.organizationSlug,
    );
    await ctx.context.queryClient.ensureQueryData(
      useOrganizationDetailsQueryOptions(currentOrganization.id),
    );
  },
});

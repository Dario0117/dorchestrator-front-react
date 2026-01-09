import { OrganizationSettingsPage } from '@components/org/pages/organization-settings.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/settings',
)({
  component: OrganizationSettingsPage,
});

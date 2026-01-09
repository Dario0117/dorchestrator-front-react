import { createFileRoute } from '@tanstack/react-router';
import { OrganizationSettingsPage } from '@/components/org/pages/organization-settings.page';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/settings',
)({
  component: OrganizationSettingsPage,
});

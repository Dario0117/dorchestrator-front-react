import { ProfilePage } from '@domains/org/pages/profile.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/profile',
)({
  component: ProfilePage,
});

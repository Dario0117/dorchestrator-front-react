import { ProfilePage } from '@components/org/pages/profile.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/profile',
)({
  component: ProfilePage,
});

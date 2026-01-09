import { DraftsPage } from '@components/org/pages/drafts.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/drafts',
)({
  component: DraftsPage,
});

import { createFileRoute } from '@tanstack/react-router';
import { QueuedSessionsPage } from '@/components/org/pages/queued-sessions.page';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/queued-sessions',
)({
  component: QueuedSessionsPage,
});

import { QueuedSessionsPage } from '@domains/org/pages/queued-sessions.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/queued-sessions',
)({
  component: QueuedSessionsPage,
});

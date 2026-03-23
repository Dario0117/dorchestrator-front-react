import { ProjectsPage } from '@domains/org/pages/projects.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/t/$teamSlug/projects',
)({
  component: ProjectsPage,
});

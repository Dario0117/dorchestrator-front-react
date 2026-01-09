import { ProjectsPage } from '@components/org/pages/projects.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(authenticated)/$organizationSlug/projects',
)({
  component: ProjectsPage,
});

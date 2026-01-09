import { HomePage } from '@components/org/pages/home.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/$organizationSlug/')({
  component: HomePage,
});

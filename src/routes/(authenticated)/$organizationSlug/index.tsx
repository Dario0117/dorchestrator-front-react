import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/org/pages/home.page';

export const Route = createFileRoute('/(authenticated)/$organizationSlug/')({
  component: HomePage,
});

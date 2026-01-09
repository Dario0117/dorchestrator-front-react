import { APIPage } from '@components/org/pages/api.page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/$organizationSlug/api')({
  component: APIPage,
});

import { useOrganizationStore } from '@stores/organization.store';
import { createFileRoute, Navigate } from '@tanstack/react-router';

function RedirectToOrganization() {
  const { currentOrganization } = useOrganizationStore();
  return (
    <Navigate
      to="/$organizationSlug"
      params={{ organizationSlug: currentOrganization.slug }}
    />
  );
}

export const Route = createFileRoute('/(authenticated)/')({
  component: RedirectToOrganization,
});

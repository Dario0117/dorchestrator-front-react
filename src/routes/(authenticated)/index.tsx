import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useOrganizationStore } from '@/stores/organization.store';

function RedirectToOrganization() {
  const { organizations } = useOrganizationStore();

  // Redirect to first organization's dashboard
  const firstOrg = organizations[0];
  if (firstOrg?.slug) {
    return (
      <Navigate
        to="/$organizationSlug"
        params={{ organizationSlug: firstOrg.slug }}
      />
    );
  }

  // If no organization, stay on this route (OrganizationCheckWrapper will handle it)
  return <div>Loading...</div>;
}

export const Route = createFileRoute('/(authenticated)/')({
  component: RedirectToOrganization,
});

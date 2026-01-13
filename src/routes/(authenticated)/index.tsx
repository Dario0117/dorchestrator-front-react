import { useUserOrganizationsSuspendedQuery } from '@services/organizations/list-user-organizations.http-service';
import { createFileRoute, Navigate } from '@tanstack/react-router';

function RedirectToOrganization() {
  const { data: organizations } = useUserOrganizationsSuspendedQuery();
  const firstOrganization = organizations[0];

  if (!firstOrganization) {
    throw new Error('No organizations found');
  }

  return (
    <Navigate
      to="/$organizationSlug"
      params={{ organizationSlug: firstOrganization.slug }}
    />
  );
}

export const Route = createFileRoute('/(authenticated)/')({
  component: RedirectToOrganization,
});

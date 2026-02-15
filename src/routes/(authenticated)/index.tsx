import { useUserOrganizationsSuspendedQuery } from '@services/organizations/list-user-organizations.http-service';
import { createFileRoute, Navigate } from '@tanstack/react-router';

function RedirectToOrganization() {
  const { data } = useUserOrganizationsSuspendedQuery();
  const organizations = data.responseData?.results ?? [];
  const firstOrganization = organizations[0];

  if (!firstOrganization) {
    return null;
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

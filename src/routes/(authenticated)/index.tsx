import { logWarning } from '@lib/logger.utils';
import { useUserOrganizationsSuspendedQuery } from '@services/organizations/list-user-organizations.http-service';
import { createFileRoute, Navigate } from '@tanstack/react-router';

function RedirectToOrganization() {
  const { data } = useUserOrganizationsSuspendedQuery();
  const organizations = data.responseData?.results ?? [];
  const explicitDefault = organizations.find((org) => org.isDefault);

  if (!explicitDefault && organizations.length > 0) {
    logWarning(
      { organizationCount: organizations.length },
      'No organization marked as default, falling back to first in list',
    );
  }

  const defaultOrganization = explicitDefault ?? organizations[0];

  if (!defaultOrganization) {
    return null;
  }

  return (
    <Navigate
      to="/$organizationSlug"
      params={{ organizationSlug: defaultOrganization.slug }}
    />
  );
}

export const Route = createFileRoute('/(authenticated)/')({
  component: RedirectToOrganization,
});

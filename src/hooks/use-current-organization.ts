import { useParams } from '@tanstack/react-router';
import { _getNullableCurrentOrganizationFromSlug } from '@/app';

export function useCurrentOrganization() {
  const params = useParams({ strict: false });

  const organizationSlug =
    'organizationSlug' in params ? params.organizationSlug : undefined;

  if (!organizationSlug) {
    throw new Error(
      'useCurrentOrganization must be used within a route with organizationSlug param',
    );
  }

  const currentOrganization =
    _getNullableCurrentOrganizationFromSlug(organizationSlug);

  // biome-ignore lint/style/noNonNullAssertion: At this point, context must be defined (validated in route.tsx:beforeLoad)
  return currentOrganization!;
}

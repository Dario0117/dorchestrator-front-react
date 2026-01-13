import { queryClient } from '@context/query.provider';
import {
  type OrganizationItem,
  useUserOrganizationsQueryOptions,
} from '@services/organizations/list-user-organizations.http-service';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

const router = createRouter({
  routeTree,
  context: {
    // biome-ignore lint/style/noNonNullAssertion: Recommendation from the lib maintainers
    queryClient: undefined!,
    _getNullableCurrentOrganizationFromSlug: ():
      | OrganizationItem
      | undefined => {
      throw new Error('Function not implemented.');
    },
    getCurrentOrganizationFromSlug: (): OrganizationItem => {
      throw new Error('Function not implemented.');
    },
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function _getNullableCurrentOrganizationFromSlug(
  slug: string,
): OrganizationItem | undefined {
  /**
   * This is a workaround
   * for the fact that the router doesn't have access to the current organization in the context
   * when you are loading the router for the first time
   */
  const organizations = queryClient.getQueryData(
    useUserOrganizationsQueryOptions.queryKey,
  ) as unknown as OrganizationItem[];
  const currentOrg = organizations.find((org) => org.slug === slug);
  return currentOrg;
}

export default function App() {
  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        _getNullableCurrentOrganizationFromSlug:
          _getNullableCurrentOrganizationFromSlug,
        getCurrentOrganizationFromSlug(slug: string) {
          // biome-ignore lint/style/noNonNullAssertion: At this point, currentOrganization must be defined (see route.tsx:beforeLoad)
          return _getNullableCurrentOrganizationFromSlug(slug)!;
        },
      }}
    />
  );
}

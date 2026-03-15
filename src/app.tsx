import { queryClient } from '@context/query.provider';
import {
  useUserOrganizationsQueryOptions,
  type useUserOrganizationsQueryReturnType,
} from '@services/organizations/list-user-organizations.http-service';
import { getAllTeamsFromCache } from '@services/teams/list-teams.http-service';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

const router = createRouter({
  routeTree,
  context: {
    // biome-ignore lint/style/noNonNullAssertion: Recommendation from the lib maintainers
    queryClient: undefined!,
    _getNullableCurrentOrganizationFromSlug: () => {
      throw new Error('Function not implemented.');
    },
    getCurrentOrganizationFromSlug: () => {
      throw new Error('Function not implemented.');
    },
    _getNullableCurrentTeamFromSlug: () => {
      throw new Error('Function not implemented.');
    },
    getCurrentTeamFromSlug: () => {
      throw new Error('Function not implemented.');
    },
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function _getNullableCurrentOrganizationFromSlug(slug: string) {
  /**
   * This is a workaround
   * for the fact that the router doesn't have access to the current organization in the context
   * when you are loading the router for the first time
   */
  const data = queryClient.getQueryData(
    useUserOrganizationsQueryOptions.queryKey,
  ) as useUserOrganizationsQueryReturnType['data'] | undefined;
  const organizations = data?.responseData?.results ?? [];
  const currentOrg = organizations.find((org) => org.slug === slug);
  return currentOrg;
}

export function _getNullableCurrentTeamFromSlug(
  orgId: string,
  teamSlug: string,
) {
  const teams = getAllTeamsFromCache();
  return teams.find((t) => t.slug === teamSlug && t.organizationId === orgId);
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
        _getNullableCurrentTeamFromSlug,
        getCurrentTeamFromSlug(orgId: string, teamSlug: string) {
          // biome-ignore lint/style/noNonNullAssertion: At this point, team must be defined (see t/$teamSlug/route.tsx:beforeLoad)
          return _getNullableCurrentTeamFromSlug(orgId, teamSlug)!;
        },
      }}
    />
  );
}

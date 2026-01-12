import { AuthenticatedLayout } from '@components/layout/authenticated-layout';
import {
  useUserOrganizationsQueryOptions,
  useUserOrganizationsSuspendedQuery,
} from '@services/organizations/list-user-organizations.http-service';
import { profileQueryOptions } from '@services/users/get-profile.http-service';
import { useOrganizationStore } from '@stores/organization.store';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)')({
  component: () => <AuthenticatedLayoutWithOrgs />,
  beforeLoad: async (ctx) => {
    try {
      await ctx.context.queryClient.ensureQueryData(profileQueryOptions);
    } catch {
      throw redirect({
        to: '/login',
        replace: true,
        search: window.location.search,
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      useUserOrganizationsQueryOptions,
    );
  },
});

const AuthenticatedLayoutWithOrgs = () => {
  const { data: organizations } = useUserOrganizationsSuspendedQuery();
  useOrganizationStore((state) => {
    state.setOrganizations(organizations);
  });
  return <AuthenticatedLayout />;
};

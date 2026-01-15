import { AuthenticatedLayout } from '@components/layout/authenticated-layout';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { profileQueryOptions } from '@services/users/get-profile.http-service';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)')({
  component: AuthenticatedLayout,
  beforeLoad: async (ctx) => {
    try {
      await ctx.context.queryClient.ensureQueryData(profileQueryOptions);
    } catch {
      throw redirect({
        to: '/login',
        replace: true,
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      useUserOrganizationsQueryOptions,
    );
  },
});

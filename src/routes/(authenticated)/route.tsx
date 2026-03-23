import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { profileQueryOptions } from '@domains/org/services/users/get-profile.http-service';
import { AuthenticatedLayout } from '@domains/shared/components/authenticated-layout';
import { logWarning } from '@lib/logger.utils';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)')({
  component: AuthenticatedLayout,
  beforeLoad: async (ctx) => {
    try {
      await ctx.context.queryClient.ensureQueryData(profileQueryOptions);
    } catch (error) {
      logWarning(
        { error, pathname: window.location.pathname },
        'Authentication check failed, redirecting to login',
      );
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

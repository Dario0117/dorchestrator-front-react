import { AuthenticatedLayout } from '@components/layout/authenticated-layout';
import { SessionCheckMiddleware } from '@components/org/pages/session-check-middleware.page';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { profileQueryOptions } from '@services/users/get-profile.http-service';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)')({
  component: () => (
    <SessionCheckMiddleware
      to="/login"
      whenProfileExist={false}
    >
      <AuthenticatedLayout />
    </SessionCheckMiddleware>
  ),
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error loading page</div>,
  loader: async (ctx) => {
    await Promise.all([
      ctx.context.queryClient.ensureQueryData(profileQueryOptions),
      ctx.context.queryClient.ensureQueryData(useUserOrganizationsQueryOptions),
    ]);
  },
});

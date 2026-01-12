import { profileQueryOptions } from '@services/users/get-profile.http-service';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(unauthenticated)')({
  component: () => <Outlet />,
  beforeLoad: async (ctx) => {
    try {
      const profile =
        await ctx.context.queryClient.ensureQueryData(profileQueryOptions);
      if (profile) {
        return redirect({
          to: '/',
          replace: true,
          search: window.location.search,
        });
      }
    } catch {
      /**
       * If no profile found let the request pass,
       * this group belongs to unauthenticated pages
       */
      return;
    }
  },
});

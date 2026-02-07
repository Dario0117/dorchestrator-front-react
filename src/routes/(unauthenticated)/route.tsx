import { logDebug, logInfo } from '@lib/logger.utils';
import { profileQueryOptions } from '@services/users/get-profile.http-service';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(unauthenticated)')({
  component: () => <Outlet />,
  beforeLoad: async (ctx) => {
    try {
      const profile =
        await ctx.context.queryClient.ensureQueryData(profileQueryOptions);
      if (profile) {
        logInfo(
          { pathname: window.location.pathname },
          'Authenticated user accessing unauthenticated route, redirecting to home',
        );
        return redirect({
          to: '/',
          replace: true,
          search: window.location.search,
        });
      }
    } catch {
      logDebug(
        { pathname: window.location.pathname },
        'No active session, allowing access to unauthenticated route',
      );
      return;
    }
  },
});

import { SessionCheckMiddleware } from '@components/org/pages/session-check-middleware.page';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(unauthenticated)')({
  component: () => (
    <SessionCheckMiddleware
      to="/"
      whenProfileExist={true}
    >
      <Outlet />
    </SessionCheckMiddleware>
  ),
});

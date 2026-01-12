import { logWarning } from '@lib/logger.utils';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/$organizationSlug')({
  component: () => <Outlet />,
  beforeLoad: (ctx) => {
    const currentOrganization =
      ctx.context._getNullableCurrentOrganizationFromSlug(
        ctx.params.organizationSlug,
      );
    if (!currentOrganization) {
      logWarning({
        message: `Someone is trying to access ${window.location.pathname} page without a valid organization ${ctx.params.organizationSlug}`,
      });
      throw redirect({
        to: '/',
        replace: true,
        search: window.location.search,
      });
    }
  },
});

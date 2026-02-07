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
      logWarning(
        {
          pathname: window.location.pathname,
          organizationSlug: ctx.params.organizationSlug,
        },
        'Access attempt without a valid organization',
      );
      throw redirect({
        to: '/',
        replace: true,
        search: window.location.search,
      });
    }
  },
});

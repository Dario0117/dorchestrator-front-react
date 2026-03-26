import { useNavigationStore } from '@domains/shared/stores/navigation.store';
import { logWarning } from '@lib/logger.utils';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '@/better-auth.client';

export const Route = createFileRoute('/(authenticated)/$organizationSlug')({
  component: () => <Outlet />,
  beforeLoad: async (ctx) => {
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
    const store = useNavigationStore.getState();
    if (store.activeOrgSlug !== ctx.params.organizationSlug) {
      await authClient.organization.setActive({
        organizationId: currentOrganization.id,
      });
      store.setActiveOrg(ctx.params.organizationSlug);
    }
  },
});

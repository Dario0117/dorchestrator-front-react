import type { AuthenticatedLayoutProps } from '@domains/shared/components/authenticated-layout.types';
import { AuthenticatedLayoutInner } from '@domains/shared/components/authenticated-layout-inner';
import { OrganizationCheckWrapper } from '@domains/shared/components/organization-check-wrapper';
import { LayoutProvider } from '@domains/shared/context/layout.provider';
import { useEventsWebSocket } from '@domains/shared/hooks/use-events-websocket';
import { useWebSocketEvents } from '@domains/shared/hooks/use-websocket-events';
import { getCookie } from '@lib/cookies.utils';
import { Outlet, useParams } from '@tanstack/react-router';
import { _getNullableCurrentOrganizationFromSlug } from '@/app';

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  useWebSocketEvents();
  const defaultOpen = getCookie('sidebar_state') !== 'false';
  const params = useParams({ strict: false });
  const hasOrganizationSlug = 'organizationSlug' in params;
  const organizationSlug = hasOrganizationSlug
    ? (params.organizationSlug as string)
    : undefined;
  const organizationId = organizationSlug
    ? _getNullableCurrentOrganizationFromSlug(organizationSlug)?.id
    : undefined;
  useEventsWebSocket(organizationId);

  if (!hasOrganizationSlug) {
    return (
      <OrganizationCheckWrapper>
        {children ?? <Outlet />}
      </OrganizationCheckWrapper>
    );
  }

  return (
    <LayoutProvider>
      <OrganizationCheckWrapper>
        <AuthenticatedLayoutInner defaultOpen={defaultOpen}>
          {children}
        </AuthenticatedLayoutInner>
      </OrganizationCheckWrapper>
    </LayoutProvider>
  );
}

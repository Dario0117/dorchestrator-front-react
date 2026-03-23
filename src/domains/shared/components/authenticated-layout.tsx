import {
  SidebarInset,
  SidebarProvider,
} from '@components/ds/organisms/sidebar';
import { AppSidebar } from '@domains/shared/components/app-sidebar';
import type { AuthenticatedLayoutProps } from '@domains/shared/components/authenticated-layout.types';
import { Header } from '@domains/shared/components/header';
import { NotificationPanel } from '@domains/shared/components/notification-panel';
import { OrganizationCheckWrapper } from '@domains/shared/components/organization-check-wrapper';
import { ProfileDropdown } from '@domains/shared/components/profile-dropdown';
import { SkipToMain } from '@domains/shared/components/skip-to-main';
import { ThemeSwitch } from '@domains/shared/components/theme-switch';
import { LayoutProvider } from '@domains/shared/context/layout.provider';
import { useEventsWebSocket } from '@domains/shared/hooks/use-events-websocket';
import { useWebSocketEvents } from '@domains/shared/hooks/use-websocket-events';
import { getCookie } from '@lib/cookies.utils';
import { cn } from '@lib/utils';
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
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-[[data-layout=fixed]]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]',
            )}
          >
            <Header fixed>
              <div className="ms-auto flex items-center space-x-4">
                <ThemeSwitch />
                <NotificationPanel />
                <ProfileDropdown />
              </div>
            </Header>
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </OrganizationCheckWrapper>
    </LayoutProvider>
  );
}

import { CommandPaletteTrigger } from '@components/ds/atoms/command-palette-trigger';
import { HStack } from '@components/ds/atoms/hstack';
import { CommandPalette } from '@components/ds/molecules/command-palette';
import { BottomNav } from '@components/ds/organisms/bottom-nav';
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
import { useCommandPalette } from '@domains/shared/hooks/use-command-palette';
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

function AuthenticatedLayoutInner({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children?: React.ReactNode;
}) {
  const { open, setOpen, handleSelect } = useCommandPalette();
  const params = useParams({ strict: false });
  const organizationSlug =
    'organizationSlug' in params ? (params.organizationSlug as string) : '';
  const teamSlug =
    'teamSlug' in params ? (params.teamSlug as string) : undefined;
  const basePath = teamSlug
    ? `/${organizationSlug}/t/${teamSlug}`
    : `/${organizationSlug}`;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToMain />
      <AppSidebar />
      <SidebarInset>
        <Header fixed>
          <CommandPaletteTrigger onClick={() => setOpen(true)} />
          <HStack
            gap="md"
            spaceInlineStart="auto"
          >
            <ThemeSwitch />
            <NotificationPanel />
            <ProfileDropdown />
          </HStack>
        </Header>
        {children ?? <Outlet />}
      </SidebarInset>
      <BottomNav basePath={basePath} />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
      />
    </SidebarProvider>
  );
}

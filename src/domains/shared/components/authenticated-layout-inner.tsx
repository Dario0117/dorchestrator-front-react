import { CommandPaletteTrigger } from '@components/ds/atoms/command-palette-trigger';
import { HStack } from '@components/ds/atoms/hstack';
import { CommandPalette } from '@components/ds/molecules/command-palette';
import { BottomNav } from '@components/ds/organisms/bottom-nav';
import {
  SidebarInset,
  SidebarProvider,
} from '@components/ds/organisms/sidebar';
import { AppSidebar } from '@domains/shared/components/app-sidebar';
import { Header } from '@domains/shared/components/header';
import { NotificationPanel } from '@domains/shared/components/notification-panel';
import { ProfileDropdown } from '@domains/shared/components/profile-dropdown';
import { SkipToMain } from '@domains/shared/components/skip-to-main';
import { ThemeSwitch } from '@domains/shared/components/theme-switch';
import { useCommandPalette } from '@domains/shared/hooks/use-command-palette';
import { Outlet, useParams } from '@tanstack/react-router';

export function AuthenticatedLayoutInner({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children?: React.ReactNode;
}) {
  const { open, setOpen, handleSelect } = useCommandPalette();
  const params = useParams({ strict: false });
  const organizationSlug = params.organizationSlug as string;
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

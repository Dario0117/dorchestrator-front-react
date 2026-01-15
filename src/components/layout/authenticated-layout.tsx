import { AppSidebar } from '@components/layout/app-sidebar';
import type { AuthenticatedLayoutProps } from '@components/layout/authenticated-layout.types';
import { Header } from '@components/layout/header';
import { OrganizationCheckWrapper } from '@components/layout/organization-check-wrapper';
import { ProfileDropdown } from '@components/profile-dropdown';
import { SkipToMain } from '@components/skip-to-main';
import { ThemeSwitch } from '@components/theme-switch';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import { LayoutProvider } from '@context/layout.provider';
import { SearchProvider } from '@context/search.provider';
import { getCookie } from '@lib/cookies.utils';
import { cn } from '@lib/utils';
import { Outlet, useParams } from '@tanstack/react-router';

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false';
  const params = useParams({ strict: false });
  const hasOrganizationSlug = 'organizationSlug' in params;

  if (!hasOrganizationSlug) {
    return (
      <OrganizationCheckWrapper>
        {children ?? <Outlet />}
      </OrganizationCheckWrapper>
    );
  }

  return (
    <SearchProvider>
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
                  <ProfileDropdown />
                </div>
              </Header>
              {children ?? <Outlet />}
            </SidebarInset>
          </SidebarProvider>
        </OrganizationCheckWrapper>
      </LayoutProvider>
    </SearchProvider>
  );
}

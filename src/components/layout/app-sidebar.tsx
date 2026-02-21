import { getSidebarData } from '@components/layout/data/sidebar-data';
import { NavGroup } from '@components/layout/nav-group';
import { OrganizationSwitcher } from '@components/layout/organization-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@components/ui/sidebar';
import { useLayout } from '@context/layout.provider';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { useUserOrganizationsSuspendedQuery } from '@services/organizations/list-user-organizations.http-service';

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const currentOrganization = useCurrentOrganization();
  const { data } = useUserOrganizationsSuspendedQuery();
  const allOrganizations = data.responseData?.results ?? [];

  const sidebarData = getSidebarData(currentOrganization, allOrganizations);

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
    >
      <SidebarHeader>
        <OrganizationSwitcher
          teams={sidebarData.teams}
          activeSlug={currentOrganization.slug}
        />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup
            key={props.title}
            {...props}
          />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

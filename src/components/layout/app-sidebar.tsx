import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useLayout } from '@/context/layout.provider';
import { useOrganizationStore } from '@/stores/organization.store';
import { getSidebarData } from './data/sidebar-data';
import { NavGroup } from './nav-group';
import { TeamSwitcher } from './team-switcher';

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { currentOrganization } = useOrganizationStore();
  const sidebarData = getSidebarData(currentOrganization);

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
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

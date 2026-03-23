import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@components/ds/organisms/sidebar';
import { useUserOrganizationsSuspendedQuery } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { getSidebarData } from '@domains/shared/components/data/sidebar-data';
import { NavGroup } from '@domains/shared/components/nav-group';
import { OrganizationSwitcher } from '@domains/shared/components/organization-switcher';
import { useLayout } from '@domains/shared/context/layout.provider';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useNavigate, useParams } from '@tanstack/react-router';

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const currentOrganization = useCurrentOrganization();
  const { data } = useUserOrganizationsSuspendedQuery();
  const allOrganizations = data.responseData?.results ?? [];
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const teamSlug =
    'teamSlug' in params ? (params.teamSlug as string) : undefined;

  if (!currentOrganization) {
    return null;
  }

  const teamsByOrgSlug = Object.fromEntries(
    allOrganizations.map((org) => [org.slug, org.teams ?? []]),
  );

  const sidebarData = getSidebarData(
    currentOrganization,
    allOrganizations,
    teamSlug,
  );

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
    >
      <SidebarHeader>
        <OrganizationSwitcher
          teams={sidebarData.teams}
          activeSlug={currentOrganization.slug}
          teamsByOrgSlug={teamsByOrgSlug}
          activeTeamSlug={teamSlug}
          onTeamChange={(newTeamSlug) => {
            const currentPath = window.location.pathname;
            const teamPathMatch = currentPath.match(/\/t\/[^/]+\/(.*)/);
            const subPath = teamPathMatch?.[1] ?? '';

            navigate({
              to: `/$organizationSlug/t/$teamSlug/${subPath}` as string,
              params: {
                organizationSlug: currentOrganization.slug,
                teamSlug: newTeamSlug,
              },
            });
          }}
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

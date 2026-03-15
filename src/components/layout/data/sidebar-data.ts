import type { SidebarData } from '@components/layout/data/sidebar-data.types';
import { Logo } from '@components/logo';
import type { OrganizationItem } from '@services/organizations/list-user-organizations.http-service';
import {
  Bookmark,
  HardDrive,
  Home,
  ScrollText,
  Settings,
  Terminal,
} from 'lucide-react';

export function getSidebarData(
  organization: OrganizationItem,
  allOrganizations: OrganizationItem[],
  teamSlug?: string,
) {
  const orgUrl = `/${organization.slug}`;
  const teamBaseUrl = teamSlug ? `/${organization.slug}/t/${teamSlug}` : orgUrl;

  const data: SidebarData = {
    teams: allOrganizations.map((org) => ({
      name: org.name,
      slug: org.slug,
      logo: Logo,
      plan: 'Free Tier',
    })),
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: `${teamBaseUrl}/`,
            icon: Home,
          },
          {
            title: 'Devices',
            url: `${teamBaseUrl}/devices`,
            icon: HardDrive,
          },
          {
            title: 'Commands',
            url: `${teamBaseUrl}/commands`,
            icon: Terminal,
          },
          {
            title: 'Terminal',
            icon: Terminal,
            items: [
              {
                title: 'Sessions',
                url: `${teamBaseUrl}/terminal`,
                icon: Terminal,
              },
              {
                title: 'Bookmarks',
                url: `${teamBaseUrl}/terminal/bookmarks`,
                icon: Bookmark,
              },
            ],
          },
        ],
      },
      {
        title: 'Settings',
        items: [
          {
            title: 'Audit Logs',
            url: `${orgUrl}/audit-logs`,
            icon: ScrollText,
          },
          {
            title: 'Organization Settings',
            url: `${orgUrl}/settings`,
            icon: Settings,
          },
        ],
      },
    ],
  };

  return data;
}

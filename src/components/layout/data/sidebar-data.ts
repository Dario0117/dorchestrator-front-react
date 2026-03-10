import type { SidebarData } from '@components/layout/data/sidebar-data.types';
import { Logo } from '@components/logo';
import type { OrganizationItem } from '@services/organizations/list-user-organizations.http-service';
import {
  Bookmark,
  HardDrive,
  History,
  Home,
  ScrollText,
  Settings,
  Terminal,
} from 'lucide-react';

export function getSidebarData(
  organization: OrganizationItem,
  allOrganizations: OrganizationItem[],
) {
  const baseUrl = `/${organization.slug}`;

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
            url: `${baseUrl}/`,
            icon: Home,
          },
          {
            title: 'Devices',
            url: `${baseUrl}/devices`,
            icon: HardDrive,
          },
          {
            title: 'Commands',
            url: `${baseUrl}/commands`,
            icon: Terminal,
          },
          {
            title: 'Sessions',
            url: `${baseUrl}/terminal`,
            icon: Terminal,
          },
          {
            title: 'Session History',
            url: `${baseUrl}/terminal/history`,
            icon: History,
          },
          {
            title: 'Bookmarks',
            url: `${baseUrl}/terminal/bookmarks`,
            icon: Bookmark,
          },
        ],
      },
      {
        title: 'Settings',
        items: [
          {
            title: 'Audit Logs',
            url: `${baseUrl}/audit-logs`,
            icon: ScrollText,
          },
          {
            title: 'Organization Settings',
            url: `${baseUrl}/settings`,
            icon: Settings,
          },
        ],
      },
    ],
  };

  return data;
}

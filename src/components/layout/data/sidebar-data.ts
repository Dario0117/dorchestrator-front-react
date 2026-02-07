import type { SidebarData } from '@components/layout/data/sidebar-data.types';
import type { OrganizationItem } from '@services/organizations/list-user-organizations.http-service';
import {
  GalleryVerticalEnd,
  HardDrive,
  Home,
  Settings,
  Terminal,
} from 'lucide-react';

export function getSidebarData(organization: OrganizationItem) {
  const baseUrl = `/${organization.slug}`;

  const data: SidebarData = {
    teams: [
      {
        name: organization.name,
        logo: GalleryVerticalEnd,
        plan: 'Free Tier',
      },
    ],
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
        ],
      },
      {
        title: 'Settings',
        items: [
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

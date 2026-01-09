import type { SidebarData } from '@components/layout/data/sidebar-data.types';
import type { OrganizationItem } from '@stores/organization.store.types';
import {
  GalleryVerticalEnd,
  HardDrive,
  Home,
  Settings,
  Terminal,
} from 'lucide-react';

export function getSidebarData(
  organization: OrganizationItem | undefined,
): SidebarData {
  const baseUrl = organization ? `/${organization.slug}` : '';

  return {
    teams: [
      {
        name: organization?.name ?? 'Dorchestrator',
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
}

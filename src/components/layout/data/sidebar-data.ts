import {
  GalleryVerticalEnd,
  HardDrive,
  Home,
  Settings,
  Terminal,
} from 'lucide-react';
import type { OrganizationItem } from '@/stores/organization.store.types';
import type { SidebarData } from './sidebar-data.types';

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

import type { NavGroup } from '@domains/shared/components/nav-group.types';
import type { Team } from '@domains/shared/components/team-switcher.types';

export type SidebarData = {
  teams: Team[];
  navGroups: NavGroup[];
};

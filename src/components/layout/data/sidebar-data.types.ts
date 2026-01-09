import type { NavGroup } from '@components/layout/nav-group.types';
import type { Team } from '@components/layout/team-switcher.types';

export type SidebarData = {
  teams: Team[];
  navGroups: NavGroup[];
};

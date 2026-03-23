import type { TeamItem } from '@domains/org/services/teams/list-teams.http-service';
import type * as React from 'react';

export type Team = {
  name: string;
  slug: string;
  logo: React.ElementType;
  plan: string;
};

export type TeamSwitcherProps = {
  teams: Team[];
  activeSlug: string;
  label?: string;
  addButtonLabel?: string;
  onAdd?: () => void;
  teamsByOrgSlug?: Record<string, TeamItem[]>;
  activeTeamSlug?: string;
  onTeamChange?: (teamSlug: string) => void;
};

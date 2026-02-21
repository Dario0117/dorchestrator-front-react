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
};

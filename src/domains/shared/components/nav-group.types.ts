import type { LinkProps } from '@tanstack/react-router';

type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
};

export type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {});
  items?: never;
};

export type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[];
  url?: LinkProps['to'] | (string & {});
};

export type NavItem = NavCollapsible | NavLink;

export type NavGroup = {
  title: string;
  items: NavItem[];
};

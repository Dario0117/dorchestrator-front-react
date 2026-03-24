import {
  BottomNavBar,
  BottomNavBarButton,
  BottomNavBarItem,
} from '@components/ds/atoms/bottom-nav-bar';
import { SmallText } from '@components/ds/atoms/small-text';
import { BottomNavMoreSheet } from '@components/ds/organisms/bottom-nav-more-sheet';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { Link, useRouterState } from '@tanstack/react-router';
import { HardDrive, Home, MoreHorizontal, Terminal } from 'lucide-react';
import { useState } from 'react';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathSegment: string;
}

const NAV_ITEMS: BottomNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, pathSegment: '' },
  { id: 'devices', label: 'Devices', icon: HardDrive, pathSegment: 'devices' },
  {
    id: 'commands',
    label: 'Commands',
    icon: Terminal,
    pathSegment: 'commands',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: Terminal,
    pathSegment: 'terminal',
  },
];

function isItemActive(href: string, pathSegment: string) {
  const parts = href.split('/').filter(Boolean);
  const teamIndex = parts.indexOf('t');
  const pageSegment = teamIndex >= 0 ? (parts[teamIndex + 2] ?? '') : '';
  return pageSegment === pathSegment;
}

interface BottomNavProps {
  basePath: string;
}

export function BottomNav({ basePath }: BottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const routerState = useRouterState();
  const href = routerState.location.pathname;
  const connectionState = useTerminalConnectionStore((s) => s.connectionState);
  const isTerminalActive = connectionState === 'connected';

  return (
    <>
      <BottomNavBar
        aria-label="Main"
        hidden={isTerminalActive}
      >
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(href, item.pathSegment);
          const to =
            item.pathSegment === ''
              ? `${basePath}/`
              : `${basePath}/${item.pathSegment}`;
          return (
            <Link
              key={item.id}
              to={to}
              aria-current={active ? 'page' : undefined}
            >
              <BottomNavBarItem active={active}>
                <item.icon className="size-5" />
                <SmallText>{item.label}</SmallText>
              </BottomNavBarItem>
            </Link>
          );
        })}
        <BottomNavBarButton
          onClick={() => setMoreOpen(true)}
          aria-label="More navigation options"
        >
          <MoreHorizontal className="size-5" />
          <SmallText>More</SmallText>
        </BottomNavBarButton>
      </BottomNavBar>
      <BottomNavMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        basePath={basePath}
      />
    </>
  );
}

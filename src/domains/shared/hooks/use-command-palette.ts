import type {
  CommandPaletteResult,
  DeviceActionId,
  NavigationId,
} from '@components/ds/molecules/command-palette.types';
import { useCurrentOrganization } from '@domains/shared/hooks/use-current-organization';
import { useHotkeysConfig } from '@domains/shared/hooks/use-hotkeys-config';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import type { FileRouteTypes } from '@/routeTree.gen';

type AppRoute = FileRouteTypes['to'];

function lookup<T extends Record<string, AppRoute>>(map: T, key: string) {
  return (key in map ? map[key as keyof T] : undefined) as
    | T[keyof T]
    | undefined;
}

const ORG_ROUTES = {
  'nav-audit-logs': '/$organizationSlug/audit-logs',
  'nav-settings': '/$organizationSlug/settings',
} as const satisfies Partial<Record<NavigationId, AppRoute>>;

const TEAM_ROUTES = {
  'nav-dashboard': '/$organizationSlug/t/$teamSlug',
  'nav-devices': '/$organizationSlug/t/$teamSlug/devices',
  'nav-commands': '/$organizationSlug/t/$teamSlug/commands',
  'nav-terminal': '/$organizationSlug/t/$teamSlug/terminal',
  'nav-terminal-bookmarks': '/$organizationSlug/t/$teamSlug/terminal/bookmarks',
} as const satisfies Partial<Record<NavigationId, AppRoute>>;

const DEVICE_ACTION_ROUTES = {
  terminal: '/$organizationSlug/t/$teamSlug/terminal',
  command: '/$organizationSlug/t/$teamSlug/commands',
  settings: '/$organizationSlug/t/$teamSlug/devices',
} as const satisfies Record<DeviceActionId, AppRoute>;

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const currentOrganization = useCurrentOrganization();
  const params = useParams({ strict: false });
  const organizationSlug = currentOrganization.slug;
  const teamSlug =
    'teamSlug' in params ? (params.teamSlug as string) : undefined;

  useHotkeysConfig({
    onCommandPalette: () => setOpen((prev) => !prev),
  });

  const handleSelect = useCallback(
    (item: CommandPaletteResult) => {
      if (item.type === 'navigation') {
        const orgRoute = lookup(ORG_ROUTES, item.id);
        if (orgRoute) {
          navigate({ to: orgRoute, params: { organizationSlug } });
          return;
        }

        if (!teamSlug) {
          return;
        }

        const teamRoute = lookup(TEAM_ROUTES, item.id);
        if (teamRoute) {
          navigate({
            to: teamRoute,
            params: { organizationSlug, teamSlug },
          });
        }
      } else if (item.type === 'device') {
        if (!teamSlug) {
          return;
        }

        const action: DeviceActionId = item.action ?? 'terminal';
        const route = lookup(DEVICE_ACTION_ROUTES, action);
        if (route) {
          navigate({
            to: route,
            params: { organizationSlug, teamSlug },
          });
        }
      } else if (item.type === 'action') {
        if (!teamSlug) {
          return;
        }

        if (item.id === 'action-new-command') {
          navigate({
            to: '/$organizationSlug/t/$teamSlug/commands',
            params: { organizationSlug, teamSlug },
            search: { executeModal: 'open' as const },
          });
        } else if (item.id === 'action-new-session') {
          navigate({
            to: '/$organizationSlug/t/$teamSlug/terminal',
            params: { organizationSlug, teamSlug },
          });
        }
      }
    },
    [navigate, organizationSlug, teamSlug],
  );

  return { open, setOpen, handleSelect };
}
